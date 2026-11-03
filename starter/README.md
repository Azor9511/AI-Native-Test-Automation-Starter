# Starter — Recovery Path

This directory is the **recovery path** for Lab 0, not the completed
solution and not the enterprise framework.

## Purpose

Environment problems happen. The goal of Lab 0 is to validate that
your environment works — but one broken machine must never block your
progress through the class.

## Decision flow

``` text
Issue
  ↓
Quick Fix
  ↓
Fixed in <5 min?
 ├── Yes → Continue
 └── No  → Starter Recovery → Continue
```

- **Quick Fix:** follow
  [../docs/troubleshooting.md](../docs/troubleshooting.md) for the
  symptom you hit.
- **Not fixed in ~5 minutes:** switch to the recovery path and keep
  moving. Resolve the environment issue later with your instructor or
  IT — do not let it consume the session.

## Recovery options

Depending on the issue, your instructor may suggest:

1. Working in a fresh minimal project directory (repeat
   [../docs/lab-0-guide.md](../docs/lab-0-guide.md) from Step 3).
2. Using a secondary machine or a clean user profile.
3. Following along with the instructor's shared screen and catching
   up asynchronously once IT resolves the environment issue.

## Note

A ready-made Playwright project is intentionally **not** distributed
in v1 — creating the project is part of Lab 0. If a packaged recovery
project is added later, it will live here with clear usage
instructions.
