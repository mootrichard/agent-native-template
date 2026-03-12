# Convert Go Kernel to TypeScript
Owner: Repo Maintainers
Last verified: 2026-03-12

## Purpose / Big Picture
Replace the in-progress Go-based runtime fixture and improvement kernel with a TypeScript implementation that is easier for contributors to read and extend. The end state should preserve the same constitutional layer, scorecards, experiment loop, ledger, runtime smoke path, and GC commands while removing Go-specific code and updating the repo to use a TypeScript-native toolchain.

## Progress
- [x] (2026-03-12 03:17Z) Audited the current Go-backed implementation, confirmed `deno` and `node` are available locally, and selected TypeScript as the replacement language.
- [x] (2026-03-12 03:22Z) Replaced the Go runtime fixture and kernel commands with TypeScript equivalents under `app/`, `cmd/`, and `internal/`.
- [x] (2026-03-12 03:23Z) Updated shell entrypoints, workflows, and repo docs to use the Deno/TypeScript toolchain.
- [x] (2026-03-12 03:26Z) Removed Go files, reran validation/score/smoke/GC commands, and executed an explicit TypeScript-backed experiment.
- [x] (2026-03-12 03:27Z) Prepared this plan for archival after final post-move validation.

## Surprises & Discoveries
- Observation: The previously completed rewrite plan already records a Python-to-Go pivot, so this conversion needs its own plan rather than silently mutating archived history.
  Evidence: `docs/exec-plans/completed/rewrite-template-improvement-kernel.md` is already archived with Go-specific outcomes.
- Observation: `deno` is installed locally and provides TypeScript execution without introducing npm package-manager dependencies.
  Evidence: `deno --version` returned `deno 2.0.2` and `typescript 5.6.2`.
- Observation: `deno check` created `deno.lock` while resolving built-in Node compatibility type metadata.
  Evidence: A new root `deno.lock` file appeared after TypeScript checking and test runs.

## Decision Log
- Decision: Use TypeScript executed by Deno rather than introducing a Node build step.
  Rationale: It keeps the toolchain dependency-light, preserves direct `.ts` execution, and avoids adding package-manager setup just to run the repo kernel.
  Date/Author: 2026-03-12 / Codex
- Decision: Keep the generated `deno.lock` file.
  Rationale: It makes Deno dependency resolution deterministic for contributors and CI instead of letting editor/test downloads drift implicitly.
  Date/Author: 2026-03-12 / Codex

## Outcomes & Retrospective
Shipped:
- TypeScript runtime fixture at `app/main.ts`
- TypeScript kernel CLI at `cmd/kernel.ts`
- TypeScript kernel modules under `internal/kernel/` and runtime helpers under `internal/runtimefixture/`
- Deno-based tests in `tests/`
- Deno-backed shell entrypoints and GitHub workflows

Behavior preserved:
- scorecard ids, artifact paths, ledger format, smoke behavior, and GC reports stayed stable across the language swap

Validation outcome:
- direct Deno-backed scripts/commands passed
- one explicit `docs-hygiene` experiment created a new promotable ledger entry
- local `make` remains blocked by the host Xcode-license issue, unchanged from earlier phases

## Context and Orientation
- Previous rewrite plan: `docs/exec-plans/completed/rewrite-template-improvement-kernel.md`
- Runtime entrypoint: `app/main.ts`
- Kernel entrypoints: `cmd/kernel.ts`, `internal/kernel/`, `internal/runtimefixture/`
- Shell wrappers to update: `scripts/install-deps.sh`, `scripts/dev.sh`, `scripts/smoke.sh`, `scripts/test.sh`
- Docs/workflows to update: `README.md`, `WORKFLOW.md`, `ARCHITECTURE.md`, `docs/*`, `.github/workflows/*.yml`

## Plan of Work
Implement a TypeScript runtime fixture and kernel command runner first, keeping the same behavior and artifact locations as the Go path. Once the TypeScript path is runnable, switch the shell entrypoints and workflows to Deno, scrub Go references from docs and plans, remove the Go source tree, and rerun the same validations and experiment flow to confirm behavior stayed intact.

## Concrete Steps
1. Add `app/main.ts`, `cmd/kernel.ts`, and TypeScript helper modules under `internal/`.
2. Switch `scripts/*.sh`, `Makefile`, and GitHub workflows from Go to Deno/TypeScript commands.
3. Update docs and scorecard descriptions to reference TypeScript/Deno paths.
4. Remove `go.mod` and the Go source/tests after the TypeScript replacement is in place.
5. Re-run docs validation, tests, smoke, scorecards, GC commands, and one experiment.

## Validation and Acceptance
- `./scripts/install-deps.sh`
- `./scripts/validate-docs.sh`
- `./scripts/test.sh`
- `./scripts/smoke.sh`
- `deno run -A ./cmd/kernel.ts baseline --vector docs-hygiene`
- `deno run -A ./cmd/kernel.ts score --vector docs-hygiene`
- `deno run -A ./cmd/kernel.ts score --vector runtime-boot`
- `deno run -A ./cmd/kernel.ts experiment --vector docs-hygiene --candidate-ref <ref>`

Observed validation:
- `./scripts/install-deps.sh`
- `./scripts/validate-docs.sh`
- `./scripts/test.sh`
- `./scripts/smoke.sh`
- `deno run -A ./cmd/kernel.ts baseline --vector docs-hygiene`
- `deno run -A ./cmd/kernel.ts score --vector docs-hygiene`
- `deno run -A ./cmd/kernel.ts score --vector runtime-boot`
- `deno run -A ./cmd/kernel.ts gc-docs`
- `deno run -A ./cmd/kernel.ts gc-structure`
- `deno run -A ./cmd/kernel.ts gc-ledger`
- `deno run -A ./cmd/kernel.ts experiment --vector docs-hygiene --baseline-ref codex/ts-exp-baseline-20260312032559 --candidate-ref codex/ts-exp-candidate-20260312032559`

## Idempotence and Recovery
- Keep artifact paths and scorecard IDs stable so the conversion stays reversible.
- Replace the runtime/kernel before deleting the Go implementation.
- If the Deno path regresses behavior, compare against the archived Go plan artifacts and fix forward.

## Interfaces and Dependencies
- Required binaries after conversion: `bash`, `git`, `deno`, `curl`
- TypeScript execution model: `deno run -A ...`
- Output locations stay unchanged: `docs/generated/improvement/`, `.tmp/runtime/`, `improvement/ledger/experiments/`

## Artifacts and Notes
- This plan is a follow-up to the archived rewrite plan, not a rewrite of that historical record.
- New explicit experiment ledger entry:
  - `improvement/ledger/experiments/2026-03-12T03-26-03Z-docs-hygiene-codex-ts-exp-candidate-20260312032559.json`
- Temporary refs created for the explicit TypeScript experiment:
  - `codex/ts-exp-baseline-20260312032559`
  - `codex/ts-exp-candidate-20260312032559`
