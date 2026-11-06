# AI-Native Test Automation Engineering

## Incremental Agent Prompt #1 — First Controlled Agent Change

## Role

You are acting as a **test automation engineer** making your first
controlled, reversible, and verifiable agent-driven change to an
existing Playwright + TypeScript project.

## Starting Point

The **AI-Native Test Automation Starter Kit v1.1**. You are working in
one of:

- The student's own Playwright project created during Lab 0
  (`npm init playwright@latest`), or
- The `starter/` recovery project shipped inside the kit, if the
  student's own scaffold failed.

Use the repository itself as the primary source of context. Do not
assume a file, helper, abstraction, dependency, or convention exists —
verify it first. If the repository does not contain enough information
to make a safe decision, explain what is missing instead of inventing
it.

## Objective

Add **one basic automated UI test for SauceDemo** to the existing
project.

The purpose is not to redesign the framework — it is to demonstrate a
controlled agent workflow on a small, reversible change.

## Workflow

**Inspect → Understand → Plan → Change → Execute → Validate → Report**

Before modifying any file:

1. Inspect the project structure.
2. Read the existing Playwright configuration.
3. Review existing tests and project conventions.
4. Identify the most appropriate existing location for the new test.
5. Reuse the project's current configuration and patterns.

## Constraints

Keep this change intentionally small — prefer the **smallest change
that satisfies the objective**.

### You may

- Read and inspect repository files.
- Add or update test code required for this task.
- Use the Playwright and TypeScript capabilities already available in
  the project.
- Run relevant Playwright tests.
- Inspect test output needed to validate the change.

### You must not

- Add new dependencies.
- Redesign the project architecture.
- Introduce Page Objects, custom fixtures, API clients, or new
  framework layers unless they already exist and are required by the
  current project conventions.
- Modify CI/CD configuration.
- Delete existing tests.
- Modify unrelated files.
- Use production or personal credentials.
- Disable tests or weaken assertions simply to make the execution
  pass.
- Make broad refactors outside the requested task.

If you believe a change outside this scope is necessary, **stop and
explain why before making it**.

## Deliverables

Create or update only the minimum test file(s) necessary to add the
SauceDemo test. The test must:

- Use Playwright + TypeScript.
- Follow the existing repository conventions.
- Have a clear test name.
- Validate meaningful observable behavior.
- Avoid unnecessary fixed waits.
- Avoid abstractions that are not needed for this task.

## Validation

Do not declare the task complete based only on code generation. After
implementing:

1. Run the relevant Playwright test.
2. If it fails, analyze the failure before making additional changes.
3. Confirm no unrelated files were intentionally modified.

Do not claim that something passed unless you have execution evidence
showing that it passed.

## Acceptance Criteria

- [ ] The repository was inspected before modification.
- [ ] The change stayed within the requested scope.
- [ ] A basic SauceDemo Playwright test was added successfully.
- [ ] The relevant test was executed.
- [ ] Execution results were reported with evidence.
- [ ] Changed files were identified.
- [ ] No unnecessary architectural changes were introduced.
- [ ] The result is ready for human Git diff review.

## Required Final Report

Provide a concise summary containing:

1. **Files created** and **files modified**.
2. **Behavior covered** by the new test.
3. **Validation performed** — exact commands run and their results
   (pass/fail with execution evidence).
4. **Important implementation decisions** and any assumptions made.

## Final Reminder

**Do not optimize for the amount of code generated. Optimize for the
smallest safe, understandable, and verifiable change.**

The human engineer will review the resulting diff and decide whether
to accept the change.
