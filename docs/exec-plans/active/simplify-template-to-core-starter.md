# Simplify Template To Core Starter
Owner: Repo Maintainers
Last verified: 2026-03-16

## Purpose / Big Picture

Reposition the repository as a balanced starter for AI-assisted software work instead of a
harness-first meta-system. The baseline should keep core guardrails, one canonical validation loop,
and the disposable runtime fixture while making generated evidence transient by default. Advanced
improvement-kernel ideas remain documented as an optional extension, not a default obligation.

## Progress
- [x] (2026-03-16 17:11Z) Reviewed current kernel, docs, tasks, CI, and tests to identify where
  complexity and tracked artifact writes are coupled to the default starter.
- [x] (2026-03-16 17:11Z) Replace default task and kernel behavior with a transient-artifact core
  loop.
- [x] (2026-03-16 17:11Z) Remove automation-harness-specific scorecards, registry, change-package,
  and ledger scaffolding from the baseline template.
- [x] (2026-03-16 17:11Z) Rewrite docs and CI around the simplified contract.
- [x] (2026-03-16 17:11Z) Run validation and confirm the worktree remains clean after baseline
  commands.

## Surprises & Discoveries
- Observation: The default test suite writes tracked ledger and generated experiment artifacts.
  Evidence: `tests/kernel_test.ts` calls `runExperiment(root, ...)`, which appends files under
  `improvement/ledger/experiments/` and `docs/generated/improvement/experiments/`.
- Observation: The current default doc surface is much larger than the starter promise requires.
  Evidence: the repo currently carries 45 Markdown docs plus tracked generated improvement JSON.

## Decision Log
- Decision: Keep `validate` as the canonical fast loop and retain `test` only as a compatibility
  alias.
  Rationale: This removes the user-facing duplication without creating unnecessary breakage for
  agents or existing scripts.
  Date/Author: 2026-03-16 / Codex
- Decision: Keep scorecards for docs hygiene and runtime boot, but make their default artifacts
  transient.
  Rationale: The vectors still add checkable value, but their evidence should not dirty tracked
  files during routine work.
  Date/Author: 2026-03-16 / Codex
- Decision: Remove automation-harness contracts from the baseline repository rather than leaving
  them half-supported.
  Rationale: Optional advanced capability is better preserved in one design doc than in a partial
  default implementation that adds maintenance burden.
  Date/Author: 2026-03-16 / Codex

## Outcomes & Retrospective

Shipped:
- a smaller baseline command surface centered on `install`, `validate`, `smoke`, optional
  scorecards, and explicit artifact publication
- transient-by-default evidence for smoke, scorecards, and GC under `.tmp/improvement/`
- removal of automation-harness scorecards, registry/change-package scaffolding, and tracked ledger
  history from the starter
- CI and tests that verify the baseline commands leave fresh working copies clean

What changed the implementation:
- `validate` could not be tested by recursively invoking itself inside a temp repo; the test suite
  needed a nested-run guard.
- docs reachability required a short but still comprehensive index, not just the six must-read
  entrypoints.

## Context and Orientation

- Root policy and map: `AGENTS.md`, `WORKFLOW.md`, `ARCHITECTURE.md`
- Command surface: `deno.json`, `cmd/kernel.ts`, `scripts/*.sh`
- Core scoring/runtime code: `internal/kernel/*.ts`, `internal/runtimefixture/runtime.ts`
- Validation and CI: `tests/`, `.github/workflows/`
- Knowledge base and scorecards: `docs/`, `scorecards/`

## Plan of Work

First simplify the executable surface so the baseline commands no longer create tracked evidence or
depend on advanced governance features. Then trim tests and CI to enforce clean-worktree behavior.
Finally rewrite the docs so the repo tells one coherent baseline story and relegates advanced
improvement-kernel ideas to an optional design note.

## Concrete Steps

1. Rewrite `deno.json`, `cmd/kernel.ts`, and `internal/kernel/*` so the baseline supports:
   `install`, `dev`, `smoke`, `validate`, `score`, `gc-docs`, `gc-structure`, `publish-artifact`,
   `free-port`, and `write-smoke-artifact`.
2. Remove automation-harness-specific code and data:
   `scripts/score-contracts.ts`, `scorecards/automation-harness-health.json`,
   `docs/scorecards/automation-harness-health.md`, registry/change-package/ledger scaffolding, and
   related tests.
3. Update scripts and scorecards so default artifacts live under `.tmp/improvement/`.
4. Rewrite tests to use temporary clones and to assert that `validate`, `smoke`, and default score
   commands do not dirty tracked files.
5. Rewrite README, AGENTS, WORKFLOW, ARCHITECTURE, and core docs to present the simplified starter.
6. Run `deno task validate`, `deno task smoke`, and targeted score/GC checks; inspect `git status`.

## Validation and Acceptance

- `deno task install`
- `deno task validate`
- `deno task smoke`
- `deno task score --vector docs-hygiene`
- `deno task score --vector runtime-boot`
- `deno task gc-docs`
- `deno task gc-structure`
- `git status --short` remains clean after the baseline commands above

## Idempotence and Recovery

- The simplification is mostly subtractive; if a removal breaks validation, restore the missing
  baseline invariant in code/docs rather than reintroducing half-retired governance machinery.
- Default artifact paths should stay under `.tmp/`, so repeated validation runs should not require
  cleanup of tracked files.

## Interfaces and Dependencies

- Public commands: `deno task install`, `deno task validate`, `deno task dev`, `deno task smoke`
- Optional score commands: `deno task score --vector docs-hygiene|runtime-boot`
- Explicit publication command: `deno task publish-artifact --from <path> --to <path>`
- External binaries required for the baseline loop: `bash`, `deno`, `git`, `curl`

## Artifacts and Notes

- Keep `docs/generated/improvement/phase-0-baseline.md` as historical context.
- Keep new optional advanced guidance in one short design doc instead of repo-wide default policy.
