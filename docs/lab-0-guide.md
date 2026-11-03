# Lab 0 — Environment Validation Guide

**Goal:** finish with a working Playwright project, an HTML report,
a Git commit, a published GitHub repository, and a visible GitHub
Actions run.

**Target duration:** 20–30 minutes if the prerequisites are already
installed. Lab 0 must not become a software-installation session —
complete
[pre-course-checklist.md](pre-course-checklist.md) beforehand.

If anything fails, use [troubleshooting.md](troubleshooting.md). If a
problem cannot be fixed in under ~5 minutes, use the recovery path in
[../starter/README.md](../starter/README.md) and continue.

## Step 1 — Validate Environment

``` bash
node -v
npm -v
git --version
```

Each should print a version. Optionally run the automated validator:

``` bash
# macOS / Linux
./scripts/verify-environment.sh

# Windows (PowerShell)
.\scripts\verify-environment.ps1
```

## Step 2 — Validate Git Identity

``` bash
git config --global user.name
git config --global user.email
```

Only configure them if they print nothing:

``` bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Step 3 — Create the Playwright Project

``` bash
mkdir ai-native-test-automation
cd ai-native-test-automation
npm init playwright@latest
```

The initializer asks a few questions. Recommended choices:

``` text
Language         → TypeScript
Tests folder     → tests
GitHub Actions   → Yes
Install browsers → Yes
```

> Wording of the prompts may differ slightly between Playwright
> versions — the intent stays the same: TypeScript, default `tests`
> folder, include the GitHub Actions workflow, install browsers.

## Step 4 — Execute the Tests

``` bash
npx playwright test
```

Expected: the example tests run and pass (Chromium/Firefox/WebKit
depending on the generated configuration).

## Step 5 — Open the HTML Report

``` bash
npx playwright show-report
```

A browser tab opens with the Playwright HTML report.

## Step 6 — Open UI Mode

``` bash
npx playwright test --ui
```

UI Mode opens an interactive runner. Close it when done.

## Step 7 — Commit with Git

First inspect the repository state — Playwright tooling may have
already initialized Git or generated a `.gitignore`:

``` bash
git status
```

- If `git status` reports "not a git repository", run `git init`
  first.
- Review which files are untracked before staging.

Then commit:

``` bash
git add .
git commit -m "Initial Playwright project"
```

## Step 8 — Publish to GitHub

1. Create a new repository on GitHub (web UI). Do **not** initialize
   it with a README — the local project already has files.
2. Check whether a remote already exists:

   ``` bash
   git remote -v
   ```

   If `origin` already exists, do **not** add it again — just push.

3. If needed, connect and push:

   ``` bash
   git remote add origin <repository-url>
   git branch -M main
   git push -u origin main
   ```

If push authentication fails, see
[troubleshooting.md](troubleshooting.md) — GitHub no longer accepts
passwords over HTTPS; use a credential manager or SSH.

## Step 9 — Validate GitHub Actions

The Playwright initializer created a workflow file under
`.github/workflows/`. After pushing:

``` text
Repository → Actions → Playwright Tests
```

Confirm the workflow run appears and completes. **Only validate that
CI executes** — we will return to this pipeline later in the CI/CD &
Quality Gates module.

## Step 10 — Final Checklist

``` text
[ ] Windsurf works
[ ] Node.js works
[ ] npm works
[ ] Git works
[ ] Playwright project exists
[ ] Tests execute
[ ] HTML report opens
[ ] UI Mode opens
[ ] Git commit exists
[ ] Repository is published
[ ] GitHub Actions is visible

ENVIRONMENT STATUS: READY
```

If everything is checked, your environment is ready for the course.
