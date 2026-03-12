# Fix Synthetic Git Snapshot Identity

Owner: Repo Maintainers

Last verified: 2026-03-12

## Purpose / Big Picture

Make the kernel experiment test independent of machine-level git configuration so `deno task test`
passes in clean CI environments. The synthetic snapshot helper should create commits with an
explicit test identity instead of depending on global `git config`.

## Progress

- [x] (2026-03-12 03:54Z) Confirmed the failure comes from `git commit-tree` inside
      `tests/kernel_test.ts` when no global git user identity is configured.
- [x] (2026-03-12 03:55Z) Patched the snapshot helper to set explicit test author/committer identity
      for all synthetic git subprocesses.
- [x] (2026-03-12 03:55Z) Re-ran `deno task test`; all 8 tests passed, including the synthetic
      snapshot experiment.

## Surprises & Discoveries

- Observation: The failing path is fully test-local; production kernel code is not invoking
  `git commit-tree` directly for this case. Evidence: `tests/kernel_test.ts` defines
  `createSnapshot()` and `runGit()` locally, and the stack trace points to those helpers.

## Decision Log

- Decision: Fix the test helper instead of requiring repo or runner git configuration. Rationale: CI
  should not rely on mutable machine state for a synthetic snapshot test. Date/Author: 2026-03-12 /
  Codex

## Outcomes & Retrospective

Shipped:

- `tests/kernel_test.ts` now injects a synthetic git author/committer identity before invoking
  `git commit-tree` in the snapshot helper.
- `deno task test` passes in this workspace without relying on preconfigured global git identity.

What did not change:

- Kernel experiment logic and production git behavior remain unchanged.

## Context and Orientation

- Failing test: `tests/kernel_test.ts`
- Relevant helper: local `runGit()` wrapper used by `createSnapshot()`
- Triggering command: `deno task test`

## Plan of Work

Inject a deterministic git author/committer identity into the test-only helper environment, then run
the default test suite to verify the regression is gone without affecting experiment behavior.

## Concrete Steps

1. Update `tests/kernel_test.ts` so `runGit()` exports a synthetic identity through environment
   variables.
2. Run `deno task test`.
3. Record the passing evidence here and move the plan to `docs/exec-plans/completed/` if no
   follow-up work remains.

## Validation and Acceptance

- `deno task test`

Acceptance criteria:

- `experiment command can compare synthetic snapshot refs` passes on a machine with no preconfigured
  git identity.
- No other tests regress.

Observed validation:

- `deno task test` (pass; 8 passed, 0 failed)

## Idempotence and Recovery

- The change is isolated to test infrastructure.
- If validation still fails, inspect other git subprocesses for identity assumptions before changing
  kernel logic.

## Interfaces and Dependencies

- `tests/kernel_test.ts::runGit(repoRoot, worktree, indexFile, args, stdin?)`
- External dependency: `git`

## Artifacts and Notes

- Validation run completed at 2026-03-12 03:55Z.
