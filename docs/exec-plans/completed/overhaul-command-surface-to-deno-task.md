# Overhaul Command Surface to Deno Task
Owner: Repo Maintainers
Last verified: 2026-03-12

## Purpose / Big Picture
Move the repository's human-facing command surface from `make` to `deno task` now that the kernel, runtime fixture, and tests are TypeScript-based. The goal is to make Deno the single toolchain entrypoint, remove the `make` indirection, and eliminate the local macOS `/usr/bin/make` blocker from the default workflow.

## Progress
- [x] (2026-03-12 03:31Z) Audited current `make` references across docs, workflows, and repo entrypoints.
- [x] (2026-03-12 03:36Z) Replaced the `Makefile` command surface with `deno.json` tasks and updated current-facing docs/workflows to use `deno task`.
- [x] (2026-03-12 03:39Z) Validated the Deno-task workflow end-to-end, fixed the post-`Makefile` GC edge case, and prepared this plan for archival.

## Surprises & Discoveries
- Observation: Current-facing docs still reference `make` heavily even though the implementation is already Deno/TypeScript.
  Evidence: `rg -n "\\bmake\\b" AGENTS.md README.md WORKFLOW.md docs .github/workflows` returned references in AGENTS, README, skills, scorecard docs, workflows, and policy docs.
- Observation: Historical plans and baseline evidence still mention `make`, but those are archival records rather than current operating instructions.
  Evidence: `docs/exec-plans/completed/*.md` and `docs/generated/improvement/phase-0-baseline.md` include `make` as part of the historical execution record.
- Observation: Removing `Makefile` exposed a GC assumption that every tracked file from `git ls-files` still exists on disk during the same working tree scan.
  Evidence: The first `deno task gc-structure` run after deleting `Makefile` failed with `No such file or directory (os error 2): readfile '/Users/richardmoot/Projects/agent-native-template/Makefile'` until `internal/kernel/gc.ts` was updated to skip missing paths.

## Decision Log
- Decision: Remove `Makefile` as an active entrypoint instead of keeping it as a compatibility shim.
  Rationale: The user explicitly asked to overhaul the repo to use `deno task`, and there are no contributor-compatibility constraints to preserve.
  Date/Author: 2026-03-12 / Codex

## Outcomes & Retrospective
Shipped:
- `deno.json` is now the only active command router for install/dev/smoke/test/validate/scoring/experiments/GC.
- Current-facing docs and GitHub workflows now instruct users to run `deno task ...`.
- `Makefile` was removed.

Behavior preserved:
- Artifact locations, scorecard IDs, smoke behavior, ledger format, and shell wrappers remained stable.
- Historical records that mention `make` remain intact as historical evidence rather than being rewritten.

Follow-up fixed during validation:
- `internal/kernel/gc.ts` now skips tracked paths that no longer exist, which keeps `gc-structure` stable during file deletions.

## Context and Orientation
- Current tool entrypoint: `deno.json`
- Shell wrappers retained under `scripts/`
- Current-facing docs to update: `AGENTS.md`, `README.md`, `WORKFLOW.md`, `docs/LINTS.md`, `docs/QUALITY_SCORE.md`, `docs/OBSERVABILITY.md`, `docs/GC.md`, `docs/product-specs/`, `docs/skills/`, `docs/scorecards/`, `docs/design-docs/improvement-kernel-v1.md`
- CI workflows to update: `.github/workflows/validate.yml`, `.github/workflows/nightly-maintenance.yml`

## Plan of Work
Define the entire repo command surface in `deno.json`, delete the `Makefile`, and rewrite current docs/workflows to use `deno task` syntax. Leave archived plans and baseline evidence as historical records. Then run the main validation, smoke, score, GC, and experiment commands through `deno task` itself to confirm the new interface is complete. This is now complete.

## Concrete Steps
1. Expand `deno.json` with task entries for install/dev/smoke/test/validate/docs-lint/baseline/score/experiment/promote/revert/gc-docs/gc-structure/gc-ledger.
2. Remove `Makefile`.
3. Update current-facing docs and GitHub workflows to use `deno task ...`.
4. Run the key commands through `deno task`.
5. Move this plan to `docs/exec-plans/completed/`.

## Validation and Acceptance
- `deno task`
- `deno task install`
- `deno task test`
- `deno task validate`
- `deno task baseline --vector docs-hygiene`
- `deno task score --vector docs-hygiene`
- `deno task smoke`
- `deno task score --vector runtime-boot`
- `deno task gc-docs`
- `deno task gc-structure`
- `deno task gc-ledger`

Observed validation:
- `deno task`
- `deno task install`
- `deno task test`
- `deno task validate`
- `deno task baseline --vector docs-hygiene`
- `deno task score --vector docs-hygiene`
- `deno task smoke`
- `deno task score --vector runtime-boot`
- `deno task gc-docs`
- `deno task gc-structure`
- `deno task gc-ledger`
- `deno task experiment --vector docs-hygiene --baseline-ref codex/ts-exp-baseline-20260312032559 --candidate-ref codex/ts-exp-candidate-20260312032559`

## Idempotence and Recovery
- Keep `scripts/` and task names stable so the command-surface swap is reversible.
- Do not rewrite archived plans/evidence except when fixing broken cross-references.
- If a current-facing doc still points at `make`, update it in the same pass and re-run docs validation.

## Interfaces and Dependencies
- Required binaries: `bash`, `git`, `deno`, `curl`
- Primary user-facing interface after this change: `deno task ...`
- Artifact/output locations remain unchanged.

## Artifacts and Notes
- Historical `make` references in completed plans and phase-0 baseline evidence are expected and should remain as historical record.
- New experiment ledger entry written through the Deno task interface:
  - `improvement/ledger/experiments/2026-03-12T03-38-56Z-docs-hygiene-codex-ts-exp-candidate-20260312032559.json`
