# AI-Native Test Automation Engineering

## Incremental Agent Prompt #04 — Controlled Architecture Refactor

> **Project evolution:** Starter Kit v1.1 → Increment #01 →
> Increment #02 → Increment #03 → **Increment #04**
>
> **Agent:** Claude Code (CLI, desktop, IDE extension, or web).
>
> **Primary rule:** Propose the architecture first. **Do not implement
> architectural changes until a human explicitly approves the
> proposal.** The existence of this prompt is not approval.

## How to Run This Prompt in Claude Code

- **Start in plan mode** (`Shift+Tab` until the status shows *plan
  mode*, or `claude --permission-mode plan`). Plan mode keeps Claude
  read-only: it can inspect files and run read-only commands but
  cannot edit. This makes the approval gate enforceable by the tool,
  not only by the prompt.
- Claude presents the Architecture Proposal (Phase 1) as its plan.
  **Approving the plan is the human approval.** Choosing "keep
  planning" / giving feedback is a request for revision.
- If you do not use plan mode, Claude must still end its turn after
  the proposal and wait for an explicit "approved" message.
- Project conventions belong in `CLAUDE.md` if the repository has one;
  Claude reads it automatically. Do not create one as part of this
  increment.
- Claude must not commit, push, or open a PR unless the human asks.
- Subagents are not needed for a repository of this size; inspect
  directly.

## Role

You are acting as a **test automation engineer** evolving an existing
Playwright + TypeScript project toward a **small, intentional,
maintainable automation architecture** — not creating a new framework
from scratch.

## Starting Point

A Playwright + TypeScript project containing Starter Kit v1.1 plus
Increments #01 (SauceDemo UI test), #02 (TypeScript improvement), and
#03 (product/cart flow) — either the student's own project or the
`starter/` recovery project continued from it.

The repository is the primary source of truth — do not assume it
matches an expected template. Inspect (with Read / Grep / Glob and
read-only shell commands such as `git status`, `git diff`, `git log`):

- repository structure, `package.json`, `tsconfig.json`,
  `playwright.config.ts`;
- existing tests and the work from Increments #01–#03 (committed **or
  still uncommitted** in the working tree);
- helpers, types/interfaces, test data, imports/exports;
- naming conventions, hooks/setup, fixtures or Page Objects if any;
- validation scripts/commands and repository state / Git diff.

Look for **evidence** of:

- repeated locators, UI mechanics, or meaningful user behavior;
- repeated dependency construction or duplicated test data;
- mixed responsibilities, hidden setup, unclear ownership;
- unnecessary coupling or large change surfaces;
- existing abstractions without a clear reason.

Do not create an abstraction merely because the course has introduced
it. Use only concepts justified by the current project: Page Objects,
Component Objects, Custom Fixtures, Test Data boundaries,
Models/Types, Configuration boundaries, clear dependency direction,
separation of responsibilities.

## Objective

Identify **real architectural pressures already present in the code**
and evolve the same repository — through an explicit human approval
gate — toward the smallest justified architecture.

Optimize for **clear responsibilities, visible test intent, localized
change, understandable dependencies, and verifiable behavior**.

## Workflow

``` text
INSPECT → UNDERSTAND → MAP RESPONSIBILITIES
→ IDENTIFY REAL DESIGN PRESSURES
→ PROPOSE THE SMALLEST JUSTIFIED ARCHITECTURE
→ STOP (end turn / plan approval) → HUMAN REVIEW / APPROVAL
→ IMPLEMENT → VALIDATE → REVIEW DIFF → REPORT
```

Before implementation, explain:

1. What architectural problems actually exist.
2. Which responsibilities are mixed or duplicated.
3. Which abstractions are justified and what each will own.
4. Who will depend on whom.
5. Which files are expected to be created, moved, or modified.
6. What complexity the proposal removes — and introduces.
7. Why the trade-off is worthwhile.

Then **STOP and wait for explicit human approval**.

## Constraints

### You may — after human approval

- Create/refine Page Objects or Component Objects when justified.
- Introduce a small custom fixture when useful.
- Clarify test-data boundaries; introduce small meaningful
  models/types.
- Improve configuration boundaries.
- Update imports/exports required by the refactor.
- Modify existing tests to consume the approved architecture.
- Remove duplication made unnecessary by the approved architecture.
- Run TypeScript validation and relevant Playwright tests.
- Inspect reports/traces when failures require investigation.
- Inspect the Git diff.
- Report out-of-scope observations without implementing them.

### You must not

- Create a new framework from scratch or replace the repository with
  a template.
- Introduce a `BasePage`/`BaseComponent` hierarchy merely for reuse.
- Create factories without real creation complexity, or generic
  `Manager` classes without precise responsibility.
- Create dumping-ground modules (`EverythingUtils`, broad
  `AutomationUtils`).
- Wrap Playwright `click()`, `fill()`, or assertions merely to hide
  Playwright.
- Introduce patterns only because they look "enterprise".
- Introduce API testing architecture, service/API clients, or
  database architecture.
- Modify CI/CD (`.github/workflows/`), introduce quality gates, or
  observability architecture.
- Add dependencies (`npm install …`) unless explicitly approved
  separately.
- Intentionally change product/test behavior.
- Weaken or remove meaningful assertions; disable/skip/quarantine
  tests to obtain green.
- Add arbitrary `waitForTimeout()` calls to hide timing problems.
- Introduce unrelated refactors or modify unrelated files.
- Expose, generate, or commit secrets.
- Commit, push, or open PRs unless the human asks.
- Claim success without execution evidence.

## Responsibility Model

| Abstraction | Owns | Does not automatically own |
| ----------- | ---- | -------------------------- |
| **Tests** | Scenario, intent, meaningful actions, business expectations | — keep scenario meaning visible |
| **Page Objects** | Page-specific UI knowledge, meaningful page behavior, stable interaction boundaries | Test data, configuration, API/DB behavior, reporting, generic assertions, every helper |
| **Component Objects** | A meaningful reusable UI region with coherent behavior and an independent reason to change | Not a class for every DOM element |
| **Fixtures** | Dependencies, capabilities, controlled setup/teardown, lifecycle management | Mysterious scenario preconditions |
| **Test Data** | Scenario conditions: users, products, orders, quantities, inputs | — |
| **Models / Types** | Contracts, ambiguity reduction, type safety, meaningful domain data | — |
| **Configuration** | Execution context: base URL, environment, browser/project settings | Scenario data, secrets |

## Dependency Direction

``` text
TEST → TEST DATA
TEST → FIXTURE → PAGE / COMPONENT → PLAYWRIGHT → APPLICATION
```

This is guidance, not a mandatory folder diagram. For every
dependency, answer: **Why does this dependency need to exist?**

## Scope Control

``` text
OBSERVED PROBLEM → CLEAR RESPONSIBILITY?
→ INDEPENDENT REASON TO CHANGE? → MEANINGFUL BENEFIT?
→ JUSTIFIED BOUNDARY
```

Choose the **smallest architectural change that meaningfully improves
the current project**. If evidence is insufficient, keep the design
simpler and report the observation.

## Architecture Smells to Avoid

- giant base classes mixing UI/API/data/assertions/config;
- generic Managers with unclear ownership;
- utility dumping grounds;
- invisible fixture/setup chains;
- excessive wrappers around useful Playwright semantics;
- pattern-first architecture justified only as "enterprise".

Always ask: **What current problem does this abstraction solve in this
repository?**

## Phase 1 — Required Architecture Proposal

1. **Current State** — relevant structure, test flow, abstractions,
   setup.
2. **Observed Design Pressures** — only evidence found in the
   repository (cite `file:line`); do not invent problems.
3. **Proposed Responsibilities**:

   | Abstraction | Responsibility | Evidence / Problem Solved | Reason to Change |
   | ----------- | -------------- | ------------------------- | ---------------- |

4. **Proposed Structure** — the smallest file/folder structure; no
   empty folders to match a pattern.
5. **Dependency Direction** — including Test Data/Configuration.
6. **Expected File Changes** — create, modify, move, delete.
7. **Trade-Offs** — complexity removed vs. introduced, and why now.
8. **Explicit Non-Goals** — API architecture, CI/CD, quality gates,
   observability, new dependencies, unrelated tests, speculative
   layers.
9. **Validation Plan** — exact commands.

## Human Approval Gate

After the Architecture Proposal: **STOP** — end the turn (or submit
the plan for approval in plan mode).

Do not create, move, delete, or modify architectural code. If changes
are requested: revise the proposal, explain the differences, stop
again, wait for approval.

**The architecture belongs to the engineering team, not the agent.**

## Phase 2 — Implementation

Only after explicit approval:

1. Preserve tested behavior and keep test intent readable.
2. Stay within approved scope; create only approved abstractions.
3. No opportunistic improvements or architecture expansion.
4. If a material deviation is needed, stop and request approval
   again.
5. Prefer small, reviewable changes.
6. Preserve repository conventions unless explicitly changed.
7. Keep Playwright semantics visible when they provide engineering
   meaning.

## Validation

Mandatory — use the repository's actual mechanisms, run through
Claude's shell tool, and quote real output.

### 1. TypeScript validation

Run the existing command (e.g., `npm run typecheck`, or
`npx tsc --noEmit` **only if `typescript` is already installed** —
`npx` must not silently download a package). If no type checker is
available, say so and propose adding one as a separate decision.

### 2. Relevant Playwright tests

Run the smallest affected test first (e.g.
`npx playwright test tests/<file>.spec.ts --project=chromium`), then
broaden (all projects). Report exact commands, passed/failed/skipped,
project/browser, and evidence.

### 3. Behavior preservation

No intentional change to scenario behavior, meaningful assertions,
expected outcomes, or test independence.

### 4. Architecture review

Responsibility ownership, real problem solved, dependency direction,
localized change, complexity removed vs. introduced, test intent,
execution evidence.

### 5. Git diff review

`git status` + `git diff`: no unrelated changes, no unapproved
dependency, no CI/CD changes, no disabled tests, no weakened
assertions, no secrets, no speculative architecture, file movement
matches the proposal, every changed file explainable.

## Failure Handling

``` text
FAILURE → HYPOTHESIS → EVIDENCE → CONCLUSION → CONTROLLED ACTION
```

Determine whether the failure is introduced or pre-existing (re-run on
the pre-refactor state if needed). Use `npx playwright show-trace` /
the HTML report for evidence. No weakened assertions, arbitrary waits,
hidden failures, or automatic redesign. If the fix materially changes
the approved architecture, **stop and request approval**.

## Acceptance Criteria

- [ ] Repository inspected before proposing architecture.
- [ ] Problems supported by repository evidence.
- [ ] Responsibilities mapped before implementation.
- [ ] Smallest justified architecture proposed.
- [ ] Dependency direction and trade-offs explained.
- [ ] Expected file changes and explicit non-goals stated.
- [ ] Agent stopped before implementation; human approval received.
- [ ] Only approved architecture implemented.
- [ ] Test intent understandable; behavior preserved.
- [ ] No unnecessary `BasePage`, factory, manager, or Playwright
      wrapper.
- [ ] No API architecture, CI/CD, quality-gate, or observability
      changes; no unapproved dependency.
- [ ] TypeScript validation executed (or its absence reported).
- [ ] Relevant Playwright tests executed with evidence.
- [ ] Final Git diff reviewed; changed files listed.
- [ ] No assertion weakened; no test disabled; no secret introduced.
- [ ] Every abstraction can justify its existence.

## Required Final Report

1. **Architecture** — approved change, responsibilities, dependency
   direction, abstractions intentionally *not* introduced.
2. **Files** — created, modified, moved, deleted.
3. **Behavior** — expected unchanged; any authorized change.
4. **Validation** — commands/results, Git diff review, architecture
   review.
5. **Assumptions**.
6. **Observations** — future improvements, not implemented.

## Architecture Review Gate

``` text
1 — RESPONSIBILITY : What does each abstraction own?
2 — PROBLEM        : What real problem does it solve?
3 — DEPENDENCIES   : Who depends on whom?
4 — CHANGE         : What change does it localize?
5 — COMPLEXITY     : What complexity does it introduce?
6 — TEST INTENT    : Is the behavior still understandable?
7 — EVIDENCE       : Did the existing behavior still pass?
```

If any answer is unclear, the architecture is **not ready for
approval**.

> **Small → Intentional → Cohesive → Explicit → Reviewable → Testable
> → Verifiable**
>
> **AI may propose the architecture. The engineer owns the decision.**
