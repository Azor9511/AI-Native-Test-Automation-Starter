import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';
import { loadRuns, saveRun } from '../../observability/history';
import { computeHistoryMetrics, computeRunMetrics } from '../../observability/metrics';
import { normalizeReport, type RunMeta } from '../../observability/normalize';
import { parseReport, parseReportText } from '../../observability/parse';
import { renderMarkdown } from '../../observability/report';
import type { RunRecord } from '../../observability/types';

// ---------------------------------------------------------------------------
// SYNTHETIC FIXTURES. Built only for logic tests of the parser, normalizer and
// metrics. They are NOT real executions and must never be used as history.
// Shape mirrors Playwright 1.64.1's JSON reporter (suites > specs > tests > results).
// ---------------------------------------------------------------------------
interface FakeTest {
  project: string;
  file: string;
  title: string;
  results: string[]; // attempt statuses in order
  status?: string; // Playwright test-level status; derived when omitted
  expectedStatus?: string;
  describe?: string;
}

function derivedStatus(results: string[]): string {
  const last = results[results.length - 1];
  if (last === 'skipped') return 'skipped';
  if (last === 'passed') return results.length > 1 ? 'flaky' : 'expected';
  return 'unexpected';
}

function fakeReport(tests: FakeTest[], extra: Record<string, unknown> = {}, startTime = '2030-01-01T00:00:00.000Z') {
  const files = [...new Set(tests.map((t) => t.file))];
  return {
    config: { version: '1.64.1', rootDir: '/synthetic/root', metadata: {} },
    suites: files.map((file) => {
      const specsOf = tests.filter((t) => t.file === file);
      const toSpec = (t: FakeTest) => ({
        title: t.title,
        file,
        tests: [
          {
            projectName: t.project,
            status: t.status ?? derivedStatus(t.results),
            expectedStatus: t.expectedStatus ?? 'passed',
            results: t.results.map((status, retry) => ({
              status,
              duration: 100,
              retry,
              errors: [],
              attachments: [],
            })),
          },
        ],
      });
      const describes = [...new Set(specsOf.filter((t) => t.describe).map((t) => t.describe as string))];
      return {
        title: file,
        file,
        specs: specsOf.filter((t) => !t.describe).map(toSpec),
        suites: describes.map((d) => ({ title: d, file, specs: specsOf.filter((t) => t.describe === d).map(toSpec), suites: [] })),
      };
    }),
    errors: [],
    stats: { startTime, duration: 1234, expected: 0, skipped: 0, unexpected: 0, flaky: 0 },
    ...extra,
  };
}

const META: RunMeta = {
  runId: 'synthetic-1',
  source: 'local',
  commitSha: null,
  workflow: null,
  evidence: ['synthetic/results.json'],
  provenance: { runId: 'reporter', commitSha: 'unknown', workflow: 'unknown' },
};

const normalize = (tests: FakeTest[], meta: Partial<RunMeta> = {}, extra: Record<string, unknown> = {}, start?: string): RunRecord =>
  normalizeReport(parseReport(fakeReport(tests, extra, start)), { ...META, ...meta });

const ok = (title: string, project = 'chromium', file = 'ui/a.spec.ts'): FakeTest => ({ project, file, title, results: ['passed'] });

test.describe('parser and normalizer', () => {
  test('valid report with passed and failed tests', () => {
    const run = normalize([ok('a'), ok('b'), { project: 'chromium', file: 'ui/a.spec.ts', title: 'c', results: ['failed'] }]);
    const m = computeRunMetrics(run);
    expect([m.total, m.passed, m.failed, m.flaky, m.skipped, m.unknown]).toEqual([3, 2, 1, 0, 0, 0]);
    expect(run.completeness).toBe('complete');
    expect(run.schemaVersion).toBe(1);
  });

  test('skipped is reported separately and excluded from the pass-rate denominator', () => {
    const run = normalize([ok('a'), { project: 'chromium', file: 'ui/a.spec.ts', title: 's', results: ['skipped'] }]);
    const m = computeRunMetrics(run);
    expect(m.skipped).toBe(1);
    expect(m.passRate).toBe(1); // 1 / (1 + 0 + 0)
  });

  test('failure followed by a successful retry is one flaky test, not two', () => {
    const run = normalize([{ project: 'chromium', file: 'ui/a.spec.ts', title: 'retry', results: ['failed', 'passed'] }]);
    expect(run.tests).toHaveLength(1);
    expect(run.tests[0].finalStatus).toBe('flaky');
    expect(run.tests[0].attempts).toHaveLength(2);
    expect(run.tests[0].durationMs).toBe(200);
    const m = computeRunMetrics(run);
    expect([m.total, m.passed, m.flaky]).toEqual([1, 0, 1]);
  });

  test('describe blocks become part of the test identity', () => {
    const run = normalize([{ ...ok('inside'), describe: 'Group' }]);
    expect(run.tests[0].title).toBe('Group › inside');
    expect(run.tests[0].id).toBe('ui/a.spec.ts::Group › inside');
  });

  test('identical titles in different projects stay distinct', () => {
    const run = normalize([ok('same', 'chromium'), ok('same', 'firefox')]);
    expect(run.tests).toHaveLength(2);
    expect(new Set(run.tests.map((t) => `${t.project}|${t.id}`)).size).toBe(2);
    expect(run.completeness).toBe('complete');
  });

  test('duplicate identity within one project makes the run partial', () => {
    const run = normalize([ok('same'), ok('same')]);
    expect(run.completeness).toBe('partial');
    expect(run.completenessReason).toContain('duplicate');
  });

  test('empty, malformed and invalid inputs are rejected explicitly', () => {
    expect(() => parseReportText('')).toThrow(/empty/);
    expect(() => parseReportText('{ not json')).toThrow(/not valid JSON/);
    expect(() => parseReportText('[]')).toThrow(/expected an object/);
    expect(() => parseReportText('{"suites": "x"}')).toThrow(/suites/);
    const missingProject = { suites: [{ title: 'f', specs: [{ title: 't', file: 'f', tests: [{ status: 'expected', results: [] }] }] }] };
    expect(() => parseReport(missingProject)).toThrow(/projectName/);
  });

  test('cancelled or partial execution is never reported as passed', () => {
    const run = normalize([ok('done'), { project: 'chromium', file: 'ui/a.spec.ts', title: 'cut', results: ['interrupted'], status: 'unexpected' }]);
    expect(run.completeness).toBe('partial');
    expect(run.tests.find((t) => t.title === 'cut')?.finalStatus).toBe('unknown');
    expect(computeRunMetrics(run).unknown).toBe(1);
  });

  test('a report with no tests is unknown, not complete', () => {
    const run = normalize([]);
    expect(run.completeness).toBe('unknown');
    expect(computeRunMetrics(run).passRate).toBeNull();
  });

  test('sensitive data in the input is not copied to the output', () => {
    const secret = 'SECRET-TOKEN-12345';
    const raw = fakeReport([{ project: 'chromium', file: 'ui/a.spec.ts', title: 'x', results: ['failed'] }]) as any;
    raw.suites[0].specs[0].tests[0].results[0].errors = [{ message: `Authorization: Bearer ${secret}` }];
    raw.suites[0].specs[0].tests[0].results[0].attachments = [{ path: `/home/user/${secret}.png` }];
    raw.errors = [];
    raw.config.metadata = { token: secret };
    const run = normalizeReport(parseReport(raw), META);
    expect(JSON.stringify(run)).not.toContain(secret);
    expect(JSON.stringify(run)).not.toContain('/synthetic/root');
  });
});

test.describe('metrics', () => {
  test('known metrics match a manual calculation', () => {
    // 6 passed, 2 failed, 1 flaky, 1 skipped -> passRate = 6 / (6 + 2 + 1) = 2/3
    const tests: FakeTest[] = [
      ...Array.from({ length: 6 }, (_, i) => ok(`p${i}`)),
      { project: 'chromium', file: 'ui/a.spec.ts', title: 'f1', results: ['failed'] },
      { project: 'chromium', file: 'ui/a.spec.ts', title: 'f2', results: ['timedOut'] },
      { project: 'chromium', file: 'ui/a.spec.ts', title: 'fl', results: ['failed', 'passed'] },
      { project: 'chromium', file: 'ui/a.spec.ts', title: 's', results: ['skipped'] },
    ];
    const m = computeRunMetrics(normalize(tests));
    expect([m.total, m.passed, m.failed, m.flaky, m.skipped, m.unknown]).toEqual([10, 6, 2, 1, 1, 0]);
    expect(m.passRate).toBeCloseTo(6 / 9, 10);
    expect(m.durationMs).toBe(1234);
  });

  test('pass rate is null (not 0) when nothing was executed', () => {
    const run = normalize([{ project: 'chromium', file: 'ui/a.spec.ts', title: 's', results: ['skipped'] }]);
    expect(computeRunMetrics(run).passRate).toBeNull();
  });

  test('single run: no fabricated trend', () => {
    const h = computeHistoryMetrics([normalize([ok('a')])]);
    expect(h.runCount).toBe(1);
    expect(h.trend.status).toBe('insufficient');
    expect(h.flakiness.status).toBe('insufficient');
  });

  test('two comparable runs produce a trend with a visible sample size', () => {
    const r1 = normalize([ok('a'), { project: 'chromium', file: 'ui/a.spec.ts', title: 'b', results: ['failed'] }], { runId: 'r1' }, {}, '2030-01-01T00:00:00.000Z');
    const r2 = normalize([ok('a'), ok('b')], { runId: 'r2' }, {}, '2030-01-02T00:00:00.000Z');
    const h = computeHistoryMetrics([r2, r1]); // order must not matter
    expect(h.trend).toMatchObject({ status: 'ok', sampleSize: 2, previousPassRate: 0.5, latestPassRate: 1, delta: 0.5 });
  });

  test('non-comparable runs raise a warning and are excluded from the trend', () => {
    const r1 = normalize([ok('a')], { runId: 'r1' }, {}, '2030-01-01T00:00:00.000Z');
    const r2 = normalize([ok('a'), ok('extra')], { runId: 'r2' }, {}, '2030-01-02T00:00:00.000Z');
    const h = computeHistoryMetrics([r1, r2]);
    expect(h.warnings.join(' ')).toContain('not comparable');
    expect(h.trend.status).toBe('insufficient');
  });

  test('incomplete runs are excluded and counted in data completeness', () => {
    const good = normalize([ok('a')], { runId: 'g' }, {}, '2030-01-01T00:00:00.000Z');
    const bad = normalize([], { runId: 'b' }, {}, '2030-01-02T00:00:00.000Z');
    const h = computeHistoryMetrics([good, bad]);
    expect(h.dataCompleteness).toBe(0.5);
    expect(h.warnings.join(' ')).toContain('incomplete');
  });

  test('flakiness frequency needs the minimum sample', () => {
    const flaky: FakeTest = { project: 'chromium', file: 'ui/a.spec.ts', title: 'fl', results: ['failed', 'passed'] };
    const runs = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        normalize([i % 2 === 0 ? flaky : ok('fl'), ok('stable')], { runId: `r${i}` }, {}, `2030-01-0${i + 1}T00:00:00.000Z`),
      );
    expect(computeHistoryMetrics(runs(4)).flakiness.status).toBe('insufficient');
    const h = computeHistoryMetrics(runs(5));
    expect(h.flakiness.status).toBe('ok');
    if (h.flakiness.status === 'ok') {
      expect(h.flakiness.tests).toHaveLength(1);
      expect(h.flakiness.tests[0]).toMatchObject({ flakyRuns: 3, runs: 5, frequency: 0.6 });
    }
  });

  test('duplicate runId is ignored with a warning', () => {
    const r = normalize([ok('a')], { runId: 'dup' });
    const h = computeHistoryMetrics([r, r]);
    expect(h.runCount).toBe(1);
    expect(h.warnings.join(' ')).toContain('Duplicate runId');
  });
});

test.describe('history storage', () => {
  const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'obs-test-'));

  test('reprocessing the same run is idempotent; a conflicting run is refused', () => {
    const dir = tmp();
    const run = normalize([ok('a')], { runId: 'idem' });
    expect(saveRun(dir, run)).toBe('created');
    expect(saveRun(dir, run)).toBe('unchanged');
    expect(fs.readdirSync(dir)).toHaveLength(1);
    expect(() => saveRun(dir, normalize([ok('a'), ok('b')], { runId: 'idem' }))).toThrow(/refusing to overwrite/);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('invalid stored files are rejected visibly, valid ones loaded', () => {
    const dir = tmp();
    saveRun(dir, normalize([ok('a')], { runId: 'good' }));
    fs.writeFileSync(path.join(dir, 'bad.json'), '{"schemaVersion": 99}');
    fs.writeFileSync(path.join(dir, 'broken.json'), '{ nope');
    const { runs, rejected } = loadRuns(dir);
    expect(runs.map((r) => r.runId)).toEqual(['good']);
    expect(rejected.map((r) => r.file).sort()).toEqual(['bad.json', 'broken.json']);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

test.describe('report', () => {
  test('single run states insufficient history and cites its evidence', () => {
    const run = normalize([ok('a')], { runId: 'one' });
    const md = renderMarkdown(computeHistoryMetrics([run]), [run], { generatedAt: 'T', source: 'synthetic', rejected: [] });
    expect(md).toContain('Insufficient history for trends');
    expect(md).toContain('synthetic/results.json');
    expect(md).toContain('Pass rate =');
  });

  test('empty history says insufficient data', () => {
    const md = renderMarkdown(computeHistoryMetrics([]), [], { generatedAt: 'T', source: 'none', rejected: [] });
    expect(md).toContain('Insufficient data: no runs found.');
  });
});
