import type { ParsedReport, ParsedTest } from './parse';
import {
  SCHEMA_VERSION,
  type Completeness,
  type FinalStatus,
  type Provenance,
  type RunRecord,
  type TestRecord,
} from './types';

export interface RunMeta {
  runId: string;
  source: 'github-actions' | 'local';
  commitSha: string | null;
  workflow: string | null;
  evidence: string[];
  provenance: Record<string, Provenance>;
}

// Final state is derived from the LAST attempt; earlier failed attempts make it flaky.
// Anything we cannot explain is 'unknown' — never 'passed'.
export function deriveFinalStatus(t: ParsedTest): FinalStatus {
  if (t.results.length === 0) return t.status === 'skipped' ? 'skipped' : 'unknown';
  const last = t.results[t.results.length - 1];
  if (t.status === 'skipped' || last.status === 'skipped') return 'skipped';
  if (last.status === 'passed') {
    if (t.expectedStatus !== null && t.expectedStatus !== 'passed') return 'unknown';
    const earlierFailure = t.results.slice(0, -1).some((r) => r.status === 'failed' || r.status === 'timedOut');
    return earlierFailure ? 'flaky' : 'passed';
  }
  if (last.status === 'failed' || last.status === 'timedOut') {
    return t.expectedStatus === 'failed' ? 'unknown' : 'failed';
  }
  return 'unknown'; // interrupted or unrecognised
}

export function normalizeReport(report: ParsedReport, meta: RunMeta): RunRecord {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const tests: TestRecord[] = report.tests.map((t) => {
    const id = `${t.file}::${t.title}`;
    const key = `${t.project}|${id}`;
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
    const durations = t.results.map((r) => r.durationMs);
    const complete = durations.length > 0 && durations.every((d): d is number => d !== null);
    return {
      id,
      project: t.project,
      file: t.file,
      title: t.title,
      finalStatus: deriveFinalStatus(t),
      durationMs: complete ? (durations as number[]).reduce((a, b) => a + b, 0) : null,
      attempts: t.results.map((r, i) => ({ attempt: i + 1, status: r.status, durationMs: r.durationMs })),
    };
  });

  let completeness: Completeness = 'complete';
  const reasons: string[] = [];
  if (tests.length === 0) {
    completeness = 'unknown';
    reasons.push('report contains no tests');
  }
  if (report.errorCount > 0) reasons.push(`reporter recorded ${report.errorCount} global error(s)`);
  if (tests.some((t) => t.attempts.some((a) => a.status === 'interrupted'))) {
    reasons.push('interrupted attempts (cancelled or aborted run)');
  }
  if (tests.some((t) => t.finalStatus === 'unknown')) reasons.push('tests with unknown final status');
  if (duplicates.length > 0) reasons.push(`duplicate test identity: ${duplicates.length}`);
  if (reasons.length > 0 && completeness === 'complete') completeness = 'partial';

  return {
    schemaVersion: SCHEMA_VERSION,
    runId: meta.runId,
    source: meta.source,
    startedAt: report.startTime,
    commitSha: meta.commitSha,
    workflow: meta.workflow,
    reporterVersion: report.version,
    durationMs: report.durationMs,
    completeness,
    completenessReason: reasons.length > 0 ? reasons.join('; ') : null,
    tests,
    evidence: meta.evidence,
    provenance: meta.provenance,
  };
}
