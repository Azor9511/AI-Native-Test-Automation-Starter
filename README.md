# AI-Native Test Automation — Starter Kit v1

Starter repository for **Lab 0 — Environment Validation Lab** of the
**AI-Native Test Automation Engineering** course.

This kit validates that your machine is ready for the course. It is a
bootstrap and recovery resource — **not** the finished enterprise
automation framework. You will build that framework progressively
during the course.

> One environment issue should never block the entire class.

## What this repository does

- Validates your environment (Node.js, npm, Git, connectivity).
- Provides platform setup and troubleshooting documentation.
- Detects common issues early and provides a recovery path
  (`/starter`) — a ready-to-run Playwright + TypeScript project — so a
  broken environment never blocks Lab 0.

## Repository structure

``` text
├── docs/                            # Checklists, setup, troubleshooting, Lab 0
├── scripts/                         # verify-environment.{sh,ps1} validators
├── starter/                         # Ready-to-run Playwright + TypeScript
│   │                                # recovery project (tests in starter/tests/)
│   └── tests/example.spec.ts
└── .github/workflows/
    ├── validate-kit.yml             # Runs the environment validators
    └── playwright.yml               # Runs the starter Playwright tests
```

## Prerequisites

| Requirement | Notes |
| ----------- | ----- |
| Laptop | 8 GB RAM minimum (16 GB recommended), 20 GB free disk |
| Internet | Stable connection to GitHub and the npm registry |
| Windsurf | AI-native IDE used during the course |
| Node.js LTS | Includes npm |
| Git | For version control and publishing to GitHub |
| GitHub account | Free account is sufficient |
| Chrome or Edge | Playwright browser execution |

### Corporate devices

If you are using a company laptop, check with your IT department before
the course. Common blockers:

- Limited permissions to install software.
- Proxy, VPN, firewall, or endpoint security that blocks downloads.
- Restricted access to GitHub, the npm registry, or browser downloads
  (required by Playwright).

See [docs/pre-course-checklist.md](docs/pre-course-checklist.md) for the
full checklist and [docs/troubleshooting.md](docs/troubleshooting.md)
for what to send to your IT team.

## Quick Start

``` text
1. Run environment validation   → scripts/verify-environment.sh or .ps1
2. Resolve failures             → docs/troubleshooting.md
3. Follow Lab 0                 → docs/lab-0-guide.md
4. Create Playwright project    → npm init playwright@latest
5. Execute tests                → npx playwright test
6. Publish to GitHub            → git push
7. Validate GitHub Actions      → Repository → Actions
```

Run the validator for your platform:

``` bash
# macOS / Linux
./scripts/verify-environment.sh

# Windows (PowerShell)
.\scripts\verify-environment.ps1
```

## Documentation

| Resource | Purpose |
| -------- | ------- |
| [docs/pre-course-checklist.md](docs/pre-course-checklist.md) | Verify hardware, software, accounts, and connectivity before the course |
| [docs/windows-setup.md](docs/windows-setup.md) | Windows (PowerShell) verification instructions |
| [docs/macos-setup.md](docs/macos-setup.md) | macOS verification instructions |
| [docs/troubleshooting.md](docs/troubleshooting.md) | Symptom-based fixes and corporate-IT escalation |
| [docs/lab-0-guide.md](docs/lab-0-guide.md) | Step-by-step Lab 0 guide |
| [starter/README.md](starter/README.md) | Ready Playwright project — recovery path when the environment cannot be fixed quickly |

## Scope

This is **Starter Kit v1**. The kit ships a plain, ready-to-run
Playwright project under `starter/` as the recovery path — it is the
standard initializer output, not a framework. The kit intentionally
does not include Page Objects, API client architecture, fixtures,
custom reporters, or CI/CD beyond validating that a workflow runs.
Those are course topics you will build later.
