// Observability contract (custom, versioned). NOT Playwright's JSON schema.
export const SCHEMA_VERSION = 1 as const;

export type FinalStatus = 'passed' | 'failed' | 'flaky' | 'skipped' | 'unknown';
export type Completeness = 'complete' | 'partial' | 'unknown';
export type Provenance = 'reporter' | 'env' | 'git' | 'unknown';

export interface Attempt {
  attempt: number;
  status: string;
  durationMs: number | null;
}

// One logical test per (project, file, full title). Retries live in `attempts`.
export interface TestRecord {
  id: string; // "<file>::<describe › ... › title>"
  project: string;
  file: string;
  title: string;
  finalStatus: FinalStatus;
  durationMs: number | null; // sum of attempts; null if any attempt lacks a duration
  attempts: Attempt[];
}

export interface RunRecord {
  schemaVersion: typeof SCHEMA_VERSION;
  runId: string;
  source: 'github-actions' | 'local';
  startedAt: string | null;
  commitSha: string | null;
  workflow: string | null;
  reporterVersion: string | null;
  durationMs: number | null; // runner duration, NOT push-to-feedback time
  completeness: Completeness;
  completenessReason: string | null;
  tests: TestRecord[];
  evidence: string[]; // real relative paths only
  provenance: Record<string, Provenance>;
}

export class ObservabilityError extends Error {}
