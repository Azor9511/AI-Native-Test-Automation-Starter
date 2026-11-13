import { ObservabilityError } from './types';

// Shape of what we read from Playwright's built-in JSON reporter (v1.64.1).
// Only the fields we need are kept; errors, stdout and attachments are never read.
export interface ParsedResult {
  status: string;
  durationMs: number | null;
  retry: number;
}
export interface ParsedTest {
  file: string;
  title: string;
  project: string;
  status: string;
  expectedStatus: string | null;
  results: ParsedResult[];
}
export interface ParsedReport {
  version: string | null;
  startTime: string | null;
  durationMs: number | null;
  errorCount: number;
  tests: ParsedTest[];
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function fail(where: string, what: string): never {
  throw new ObservabilityError(`Invalid Playwright report at ${where}: ${what}`);
}

export function parseReportText(text: string): ParsedReport {
  if (text.trim() === '') throw new ObservabilityError('Playwright report file is empty');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new ObservabilityError('Playwright report is not valid JSON');
  }
  return parseReport(raw);
}

export function parseReport(raw: unknown): ParsedReport {
  if (!isObj(raw)) fail('$', 'expected an object');
  if (!Array.isArray(raw.suites)) fail('$.suites', 'expected an array');

  const tests: ParsedTest[] = [];
  const walk = (suite: unknown, path: string[], where: string, root: boolean): void => {
    if (!isObj(suite)) fail(where, 'suite must be an object');
    const title = str(suite.title);
    // Top-level suites are files; nested suites are describe blocks.
    const here = root ? path : [...path, title ?? ''];
    const specs = suite.specs ?? [];
    if (!Array.isArray(specs)) fail(`${where}.specs`, 'expected an array');
    specs.forEach((spec, i) => {
      const w = `${where}.specs[${i}]`;
      if (!isObj(spec)) fail(w, 'spec must be an object');
      const specTitle = str(spec.title);
      const file = str(spec.file) ?? str(suite.file);
      if (specTitle === null || file === null) fail(w, 'missing title or file');
      if (!Array.isArray(spec.tests)) fail(`${w}.tests`, 'expected an array');
      spec.tests.forEach((t, j) => {
        const tw = `${w}.tests[${j}]`;
        if (!isObj(t)) fail(tw, 'test must be an object');
        const project = str(t.projectName);
        const status = str(t.status);
        if (project === null || status === null) fail(tw, 'missing projectName or status');
        if (!Array.isArray(t.results)) fail(`${tw}.results`, 'expected an array');
        const results = t.results.map((r, k) => {
          if (!isObj(r) || str(r.status) === null) fail(`${tw}.results[${k}]`, 'missing status');
          return {
            status: r.status as string,
            durationMs: num(r.duration),
            retry: num(r.retry) ?? k,
          };
        });
        tests.push({
          file: file.replace(/\\/g, '/'),
          title: [...here, specTitle].filter((s) => s !== '').join(' › '),
          project,
          status,
          expectedStatus: str(t.expectedStatus),
          results,
        });
      });
    });
    const children = suite.suites ?? [];
    if (!Array.isArray(children)) fail(`${where}.suites`, 'expected an array');
    children.forEach((c, i) => walk(c, here, `${where}.suites[${i}]`, false));
  };
  raw.suites.forEach((s, i) => walk(s, [], `$.suites[${i}]`, true));

  const config = isObj(raw.config) ? raw.config : {};
  const stats = isObj(raw.stats) ? raw.stats : {};
  return {
    version: str(config.version),
    startTime: str(stats.startTime),
    durationMs: num(stats.duration),
    errorCount: Array.isArray(raw.errors) ? raw.errors.length : 0,
    tests,
  };
}
