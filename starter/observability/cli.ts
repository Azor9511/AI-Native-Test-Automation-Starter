import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { loadRuns, saveRun } from './history';
import { computeHistoryMetrics } from './metrics';
import { normalizeReport, type RunMeta } from './normalize';
import { parseReportText } from './parse';
import { renderHtml, renderMarkdown } from './report';
import { ObservabilityError, type Provenance } from './types';

function option(args: string[], name: string, fallback: string): string {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

function gitSha(): string | null {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

function buildMeta(resultsFile: string, startedAt: string | null): RunMeta {
  const env = process.env;
  const rel = path.relative(process.cwd(), resultsFile).replace(/\\/g, '/');
  if (env.GITHUB_ACTIONS === 'true' && env.GITHUB_RUN_ID) {
    const provenance: Record<string, Provenance> = {
      runId: 'env',
      commitSha: env.GITHUB_SHA ? 'env' : 'unknown',
      workflow: env.GITHUB_WORKFLOW ? 'env' : 'unknown',
    };
    return {
      runId: `${env.GITHUB_RUN_ID}-${env.GITHUB_RUN_ATTEMPT ?? '1'}`,
      source: 'github-actions',
      commitSha: env.GITHUB_SHA ?? null,
      workflow: env.GITHUB_WORKFLOW ?? null,
      evidence: [rel],
      provenance,
    };
  }
  // Local run: the commit is HEAD and may not match uncommitted code under test.
  const sha = gitSha();
  return {
    runId: `local-${(startedAt ?? 'unknown-time').replace(/[^0-9A-Za-z]/g, '')}`,
    source: 'local',
    commitSha: sha,
    workflow: null,
    evidence: [rel],
    provenance: { runId: 'reporter', commitSha: sha ? 'git' : 'unknown', workflow: 'unknown' },
  };
}

function main(argv: string[]): number {
  const [command, ...args] = argv;
  if (command === 'normalize') {
    const file = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--out') ?? 'test-results/results.json';
    const dir = option(args, '--out', 'observability/runs');
    if (!fs.existsSync(file)) throw new ObservabilityError(`Results file not found: ${file}`);
    const parsed = parseReportText(fs.readFileSync(file, 'utf8'));
    const run = normalizeReport(parsed, buildMeta(file, parsed.startTime));
    const outcome = saveRun(dir, run);
    const why = run.completenessReason ? `: ${run.completenessReason}` : '';
    console.log(`${outcome}: ${run.runId} (${run.tests.length} tests, completeness=${run.completeness}${why})`);
    return 0;
  }
  if (command === 'report') {
    const dir = option(args, '--dir', 'observability/runs');
    const out = option(args, '--out', 'observability/report');
    const { runs, rejected } = loadRuns(dir);
    const metrics = computeHistoryMetrics(runs);
    const ctx = { generatedAt: new Date().toISOString(), source: `${dir} (${runs.length} stored run file(s))`, rejected };
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(`${out}.md`, renderMarkdown(metrics, runs, ctx), 'utf8');
    fs.writeFileSync(`${out}.html`, renderHtml(metrics, runs, ctx), 'utf8');
    console.log(`report written: ${out}.md, ${out}.html (${runs.length} run(s), ${rejected.length} rejected)`);
    return 0;
  }
  console.error('Usage: cli normalize [results.json] [--out dir] | cli report [--dir dir] [--out basename]');
  return 2;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (e) {
  console.error(`observability error: ${e instanceof Error ? e.message : 'unknown error'}`);
  process.exitCode = 1;
}
