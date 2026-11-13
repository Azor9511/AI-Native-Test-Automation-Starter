# CI quality gates (Increment #07)

Workflow: `.github/workflows/playwright.yml` — name **Playwright Tests**, job **test**.

## What it checks (in order)

| Step | Command | Fails when |
|---|---|---|
| Install | `npm ci` (in `starter/`) | lockfile and `package.json` disagree |
| TypeScript check | `npm run typecheck` | any type error |
| API tests | `npx playwright test --project=api` | any DummyJSON test fails, or no test is selected |
| UI tests | `npx playwright test --project=chromium --project=firefox --project=webkit` | any SauceDemo/mocking test fails |

SauceDemo (UI) and DummyJSON (API) are separate systems and run as separate steps; they share no data or session.
Playwright exits non-zero when a project selects zero tests, so an empty filter cannot go green.

## Evidence

Artifacts (retained 30 days, uploaded even when tests fail):

- `playwright-report` — HTML report.
- `playwright-test-results` — traces (first retry), screenshots of failures.

Open a trace with `npx playwright show-trace <trace.zip>`.

## Run the same checks locally

```bash
cd starter
npm ci
npm run typecheck
npx playwright install
npx playwright test --project=api
npx playwright test --project=chromium --project=firefox --project=webkit
```

## Troubleshooting

- **Typecheck fails only in CI:** run `npm ci` locally (not `npm install`) to match the lockfile.
- **UI/API step fails with network errors:** saucedemo.com or dummyjson.com may be down; re-run the job before changing tests.
- **No artifacts:** the run was cancelled, or the job failed before tests started.

## Required status check (manual configuration)

This repository does not enable or verify any branch protection. A repository admin can require the check manually:

1. GitHub → Settings → Branches (or Rules → Rulesets).
2. Add a rule for `main`; enable *Require status checks to pass*.
3. Select **Playwright Tests / test**.

Status: **not configured / not verified** by this increment.
