# Observability & feedback (Increment #08)

Turns real Playwright results into normalized data, deterministic metrics and a static report.
Observing is not inventing: if data is missing the report says **Insufficient data**.

## Flow

```text
Playwright JSON reporter  ->  parse.ts (validate real format)  ->  normalize.ts (contract v1)
  -> history.ts (one file per runId, idempotent)  ->  metrics.ts (pure)  ->  report.ts (md + html)
```

All code lives in `starter/observability/`. No new dependencies; the CLI is compiled with the existing `tsc`.

## Use (from `starter/`)

```bash
npx playwright test                      # also writes test-results/results.json (JSON reporter)
npm run obs:normalize                    # results.json -> observability/runs/<runId>.json
npm run obs:normalize -- path/to/results.json
npm run obs:report                       # observability/report.md + report.html
npm run obs:test                         # logic tests (no browser, no network)
```

`observability/runs/`, `observability/dist/` and `observability/report.*` are git-ignored. Run history is **local**:
CI artifacts expire (30 days) and are not a durable store. Delete `observability/runs/` to clear history.
Playwright cleans `test-results/` at the start of every run; normalize before running again.

## Contract (`schemaVersion: 1`, custom - not Playwright's schema)

| Field | Meaning |
|---|---|
| `runId` | CI: `GITHUB_RUN_ID-attempt`; local: `local-<reporter start time>` |
| `source`, `startedAt`, `commitSha`, `workflow`, `provenance` | metadata; `null`/`unknown` when not verifiable |
| `completeness` | `complete`, `partial` (interrupted, duplicates, unknown tests, reporter errors) or `unknown` (no tests) + `completenessReason` |
| `tests[]` | one **logical** test per project + file + full title; `finalStatus` and `attempts[]` kept apart |
| `evidence[]` | relative path of the real source file; never invented URLs |

`finalStatus` is derived from the last attempt: `passed`; `flaky` (passed after a failed/timed-out attempt); `failed`; `skipped`; otherwise `unknown` (never `passed`).
Errors, stdout, attachments and absolute paths from the source are **not** copied.
Dedup key: `runId | project | id`. Re-normalizing the same run is a no-op; a different payload for an existing `runId` is refused.

## Metrics

| Metric | Formula | Notes |
|---|---|---|
| passed / failed / flaky / skipped / unknown | logical test counts per run | |
| Pass rate | `passed / (passed + failed + flaky)` | skipped and unknown excluded and shown apart; `n/a` if denominator is 0 |
| Run duration | reporter `stats.duration` | runner time, not push-to-feedback |
| Data completeness | `complete runs / processed runs` | |
| Trend | latest vs previous pass rate | needs >= 2 complete, comparable runs |
| Flakiness frequency | `runs with flaky / comparable runs` per test | needs >= 5 comparable runs |

"Comparable" = same set of project+test ids as the latest complete run. Correlation is not causation; 100% pass rate is not absence of risk.

## Limitations

- Local `commitSha` is `HEAD` and can differ from uncommitted code that was tested.
- Format is validated against Playwright **1.64.1**; other versions may be rejected or mis-read - check `reporterVersion`.
- Not wired into CI: no workflow changes were made in this increment.

## Feedback loop

Signal (report) -> evidence (original `results.json`, trace/report) -> hypothesis -> proposed action -> human approval -> later validation with a new run. A metric never justifies changing tests, retries, skips or checks by itself.

## Rollback

Revert the Increment #08 commit, or delete `starter/observability/`, `starter/tests/observability/`, `starter/tsconfig.observability.json`, and undo the config/script/.gitignore lines.
