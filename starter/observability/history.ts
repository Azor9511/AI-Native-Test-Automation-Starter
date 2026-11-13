import * as fs from 'node:fs';
import * as path from 'node:path';
import { ObservabilityError, SCHEMA_VERSION, type RunRecord } from './types';

const STATUSES = ['passed', 'failed', 'flaky', 'skipped', 'unknown'];

export function validateRunRecord(raw: unknown): RunRecord {
  const r = raw as Partial<RunRecord> | null;
  if (typeof r !== 'object' || r === null) throw new ObservabilityError('run record is not an object');
  if (r.schemaVersion !== SCHEMA_VERSION) {
    throw new ObservabilityError(`unsupported schemaVersion: ${String(r.schemaVersion)}`);
  }
  if (typeof r.runId !== 'string' || r.runId === '') throw new ObservabilityError('runId missing');
  if (!Array.isArray(r.tests)) throw new ObservabilityError('tests missing');
  if (!['complete', 'partial', 'unknown'].includes(r.completeness as string)) {
    throw new ObservabilityError('invalid completeness');
  }
  for (const t of r.tests) {
    if (typeof t?.id !== 'string' || typeof t.project !== 'string' || !STATUSES.includes(t.finalStatus)) {
      throw new ObservabilityError('invalid test record');
    }
  }
  return r as RunRecord;
}

const fileFor = (dir: string, runId: string): string =>
  path.join(dir, `${runId.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);

// Idempotent: same runId + same content is a no-op; same runId + different content is refused.
export function saveRun(dir: string, run: RunRecord): 'created' | 'unchanged' {
  const file = fileFor(dir, run.runId);
  const content = `${JSON.stringify(run, null, 2)}\n`;
  if (fs.existsSync(file)) {
    if (fs.readFileSync(file, 'utf8') === content) return 'unchanged';
    throw new ObservabilityError(`Run ${run.runId} already stored with different content; refusing to overwrite`);
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  return 'created';
}

export function loadRuns(dir: string): { runs: RunRecord[]; rejected: { file: string; reason: string }[] } {
  const runs: RunRecord[] = [];
  const rejected: { file: string; reason: string }[] = [];
  if (!fs.existsSync(dir)) return { runs, rejected };
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    try {
      runs.push(validateRunRecord(JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))));
    } catch (e) {
      rejected.push({ file: name, reason: e instanceof Error ? e.message : 'unreadable' });
    }
  }
  return { runs, rejected };
}
