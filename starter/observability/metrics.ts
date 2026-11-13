import type { Completeness, RunRecord } from './types';

export const MIN_FLAKY_SAMPLE = 5;

export interface RunMetrics {
  runId: string;
  completeness: Completeness;
  total: number;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  unknown: number;
  passRate: number | null; // passed / (passed + failed + flaky); null when the denominator is 0
  durationMs: number | null;
}

export function computeRunMetrics(run: RunRecord): RunMetrics {
  const count = (s: string): number => run.tests.filter((t) => t.finalStatus === s).length;
  const passed = count('passed');
  const failed = count('failed');
  const flaky = count('flaky');
  const denominator = passed + failed + flaky;
  return {
    runId: run.runId,
    completeness: run.completeness,
    total: run.tests.length,
    passed,
    failed,
    flaky,
    skipped: count('skipped'),
    unknown: count('unknown'),
    passRate: denominator > 0 ? passed / denominator : null,
    durationMs: run.durationMs,
  };
}

export interface FlakyTest {
  project: string;
  id: string;
  flakyRuns: number;
  runs: number;
  frequency: number;
}

export interface HistoryMetrics {
  runCount: number;
  completeRunCount: number;
  dataCompleteness: number | null; // complete runs / processed runs
  perRun: RunMetrics[];
  comparableRunCount: number;
  warnings: string[];
  trend:
    | { status: 'insufficient'; sampleSize: number }
    | { status: 'ok'; sampleSize: number; previousPassRate: number; latestPassRate: number; delta: number };
  flakiness:
    | { status: 'insufficient'; sampleSize: number; minSample: number }
    | { status: 'ok'; sampleSize: number; minSample: number; tests: FlakyTest[] };
}

const signature = (run: RunRecord): string => run.tests.map((t) => `${t.project}|${t.id}`).sort().join('\n');

export function computeHistoryMetrics(input: RunRecord[], minFlakySample = MIN_FLAKY_SAMPLE): HistoryMetrics {
  const warnings: string[] = [];
  const byId = new Map<string, RunRecord>();
  for (const run of input) {
    if (byId.has(run.runId)) warnings.push(`Duplicate runId ignored: ${run.runId}`);
    else byId.set(run.runId, run);
  }
  const runs = [...byId.values()].sort((a, b) => {
    if (a.startedAt === b.startedAt) return a.runId.localeCompare(b.runId);
    if (a.startedAt === null) return 1;
    if (b.startedAt === null) return -1;
    return a.startedAt.localeCompare(b.startedAt);
  });

  const complete = runs.filter((r) => r.completeness === 'complete');
  if (complete.length < runs.length) {
    warnings.push(`${runs.length - complete.length} incomplete run(s) excluded from trend and flakiness`);
  }

  const latest = complete[complete.length - 1];
  const comparable = latest ? complete.filter((r) => signature(r) === signature(latest)) : [];
  if (latest && comparable.length < complete.length) {
    warnings.push(
      `${complete.length - comparable.length} run(s) cover a different set of tests/projects and are not comparable with the latest run`,
    );
  }

  const rates = comparable.map((r) => computeRunMetrics(r).passRate);
  const last = rates[rates.length - 1];
  const prev = rates[rates.length - 2];
  const trend: HistoryMetrics['trend'] =
    last !== undefined && prev !== undefined && last !== null && prev !== null
      ? { status: 'ok', sampleSize: rates.length, previousPassRate: prev, latestPassRate: last, delta: last - prev }
      : { status: 'insufficient', sampleSize: rates.filter((r) => r !== null).length };

  let flakiness: HistoryMetrics['flakiness'] = {
    status: 'insufficient',
    sampleSize: comparable.length,
    minSample: minFlakySample,
  };
  if (comparable.length >= minFlakySample) {
    const tally = new Map<string, FlakyTest>();
    for (const run of comparable) {
      for (const t of run.tests) {
        const key = `${t.project}|${t.id}`;
        const e = tally.get(key) ?? { project: t.project, id: t.id, flakyRuns: 0, runs: 0, frequency: 0 };
        e.runs += 1;
        if (t.finalStatus === 'flaky') e.flakyRuns += 1;
        tally.set(key, e);
      }
    }
    const tests = [...tally.values()]
      .map((e) => ({ ...e, frequency: e.flakyRuns / e.runs }))
      .filter((e) => e.flakyRuns > 0)
      .sort((a, b) => b.frequency - a.frequency);
    flakiness = { status: 'ok', sampleSize: comparable.length, minSample: minFlakySample, tests };
  }

  return {
    runCount: runs.length,
    completeRunCount: complete.length,
    dataCompleteness: runs.length > 0 ? complete.length / runs.length : null,
    perRun: runs.map(computeRunMetrics),
    comparableRunCount: comparable.length,
    warnings,
    trend,
    flakiness,
  };
}
