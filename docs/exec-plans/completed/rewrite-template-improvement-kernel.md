# Rewrite Template Into a Self-Improving Kernel
Owner: Repo Maintainers
Last verified: 2026-03-12

## Purpose / Big Picture
Rewrite the template so it keeps its current constitutional, docs-first shape while becoming bootable and able to score and improve itself. The finished repo should have a protected workflow layer, executable scorecards, a minimal baseline/candidate experiment loop, an append-only experiment ledger, a tiny standard-library runtime fixture, repo-local specs and skills, and recurring report-only maintenance automation.

## Progress
- [x] (2026-03-12 01:17Z) Read repo entrypoints (`docs/index.md`, `docs/PLANS.md`, core scripts/docs) and confirmed the current baseline is docs validation plus placeholder install/dev commands.
- [x] (2026-03-12 01:19Z) Created this ExecPlan and the generated-improvement evidence directory so the rewrite has a live system-of-record.
- [x] (2026-03-12 01:25Z) Ran and recorded baseline behavior for `make install`, `make dev`, `make test`, and `make validate`, including the current environment blocker on `/usr/bin/make`.
- [x] (2026-03-12 02:35Z) Split map vs constitution by adding `WORKFLOW.md`, updating `AGENTS.md`, and extending docs validation.
- [x] (2026-03-12 02:48Z) Added scorecards plus Go-backed baseline/score commands for docs hygiene and runtime boot.
- [x] (2026-03-12 03:12Z) Added the experiment/promote/revert loop with append-only ledger handling and Go tests.
- [x] (2026-03-12 03:10Z) Replaced the placeholder runtime with a minimal bootable Go fixture and smoke path.
- [x] (2026-03-12 02:40Z) Added product specs, skills, GC commands, scheduled maintenance workflow, and repo-wide doc updates.
- [x] (2026-03-12 03:13Z) Ran final Go-backed validation commands, recorded one harmless experiment, and prepared this plan for archival.

## Surprises & Discoveries
- Observation: The current repo already has a solid constitutional/docs hygiene foundation, but no runtime fixture or executable scorecard layer.
  Evidence: `scripts/validate-docs.sh` enforces metadata, reachability, design-doc indexing, and ExecPlan placement; `scripts/dev.sh` and `scripts/install-deps.sh` only print placeholder messages.
- Observation: The docs validator currently treats `AGENTS.md`, `README.md`, and `ARCHITECTURE.md` as special root docs with metadata requirements.
  Evidence: `scripts/validate-docs.sh` explicitly includes those three files in its metadata check set and no other root markdown files.
- Observation: `docs/generated/` is already considered part of the knowledge base, so generated improvement artifacts can live there as long as they stay indexed.
  Evidence: `docs/index.md` links `docs/generated/README.md`, and the reachability check traverses indexed directories and `README.md` / `index.md` entrypoints.
- Observation: In this environment, `make` is blocked before the repo Makefile runs because macOS is requiring Xcode license acceptance.
  Evidence: Each baseline `make <target>` invocation exited `69` with "You have not agreed to the Xcode license agreements..." before any repo script output appeared.
- Observation: The underlying repository scripts do work when invoked directly, so the baseline repo logic is valid independently of the host `make` binary blocker.
  Evidence: `./scripts/install-deps.sh`, `./scripts/dev.sh`, `./scripts/test.sh`, and `./scripts/validate.sh` all ran successfully after the blocked `make` attempts.
- Observation: Mid-rewrite, the implementation constraint changed from "Python allowed" to "no Python"; the kernel/runtime now needs a different language.
  Evidence: User follow-up: "I prefer it be written in TypeScript, Rust, or Go, but not Python."

## Decision Log
- Decision: Keep this rewrite additive and use the existing docs validator as the base enforcement mechanism rather than replacing it.
  Rationale: The brief explicitly preserves the current mechanical docs hygiene strengths; extending the existing shell validator is lower risk and easier to audit.
  Date/Author: 2026-03-12 / Codex
- Decision: Implement the kernel/runtime in Go and keep Bash only for entrypoint scripts.
  Rationale: This was the selected implementation at the time of that rewrite pass; a later follow-up plan converted the same surface to TypeScript after a user-requested language change.
  Date/Author: 2026-03-12 / Codex

## Outcomes & Retrospective
Shipped:
- `WORKFLOW.md` as the protected constitutional layer while keeping `AGENTS.md` short and map-like
- executable `docs-hygiene` and `runtime-boot` scorecards
- a Go-based improvement kernel (`cmd/kernel`, `internal/kernel`) with baseline, score, experiment, promote, revert, and GC commands
- a bootable local HTTP runtime fixture (`app/main.go`) with structured logs, health, metrics, request ids, and a smoke script
- repo-local product specs, skills, design history, and generated-improvement evidence paths
- report-only scheduled GC workflow plus local GC commands

What changed during execution:
- The implementation language pivoted from the original Python draft to Go during this pass.
- A later follow-up plan (`docs/exec-plans/completed/convert-go-kernel-to-typescript.md`) converts the same surface to TypeScript without rewriting this historical record.

Validation outcome:
- Direct repo entrypoints and Go commands passed.
- Local `make` verification remains blocked by the host macOS/Xcode license issue, but the underlying scripts/Go entrypoints that `make` would call were validated directly.

## Context and Orientation
- Repo map: `AGENTS.md`, `README.md`, `ARCHITECTURE.md`, `docs/index.md`
- Planning rules: `docs/PLANS.md`, `docs/exec-plans/README.md`
- Current enforcement: `scripts/validate-docs.sh`, `scripts/test.sh`, `scripts/validate.sh`, `Makefile`
- Existing policy/quality docs to update: `docs/LINTS.md`, `docs/QUALITY_SCORE.md`, `docs/OBSERVABILITY.md`, `docs/RELIABILITY.md`, `docs/GC.md`, `docs/FRONTEND.md`
- CI entrypoint: `.github/workflows/validate.yml`

## Plan of Work
Phase 0 records the template baseline and writes the evidence into `docs/generated/improvement/` before changing behavior. Phase 1 introduces a dedicated constitutional document (`WORKFLOW.md`) and teaches the validator to protect it. Phases 2 and 3 add scorecards plus a small improvement kernel that can score a vector, compare baseline vs candidate refs in isolated worktrees, and record immutable ledger entries before any promotion happens. Phases 4 and 5 add a bootable standard-library HTTP fixture and a runtime scorecard built on top of deterministic smoke artifacts. Phases 6 through 8 fill in repo-local specs and skills, turn GC from prose into runnable scripts and scheduled workflows, update architecture/quality docs to reflect the new default operating model, and finish by running the required validation matrix and archiving the completed plan.

## Concrete Steps
1. Run `make install`, `make dev`, `make test`, and `make validate`, then record outputs in `docs/generated/improvement/phase-0-baseline.md`.
2. Add `WORKFLOW.md`, the improvement-kernel design doc, and validator/index updates so the constitutional layer is explicit and protected.
3. Create `scorecards/`, Go-backed baseline/score commands, and docs for vector zero (`docs-hygiene`).
4. Create `improvement/ledger/`, Go-backed experiment/promote/revert commands, and unit tests for comparison/ledger logic.
5. Add the runtime fixture under `app/`, update dev/install scripts, and add `scripts/smoke.sh` plus runtime tests/artifacts.
6. Add runtime scorecard docs/JSON, expand observability/reliability docs, and decide whether runtime smoke belongs in `make validate`.
7. Add product specs, repo-local skill docs, GC scripts, and scheduled maintenance workflow.
8. Run the required commands, record evidence/artifacts, move the plan to completed, and update retrospective notes.

## Validation and Acceptance
- Baseline commands still pass before structural changes: `make install`, `make dev`, `make test`, `make validate`.
- Final required commands succeed: `make help`, `make install`, `make test`, `make validate`, `make baseline VECTOR=docs-hygiene`, `make score VECTOR=docs-hygiene`, `make smoke`, `make score VECTOR=runtime-boot`.
- At least one harmless branch comparison produces a ledger entry under `improvement/ledger/experiments/`.
- Docs validation continues to enforce metadata, reachability, and design-doc indexing for all new docs.

Observed validation in this environment:
- `./scripts/install-deps.sh`
- `./scripts/validate-docs.sh`
- `./scripts/test.sh`
- `./scripts/smoke.sh`
- `go run ./cmd/kernel baseline --vector docs-hygiene`
- `go run ./cmd/kernel score --vector docs-hygiene`
- `go run ./cmd/kernel score --vector runtime-boot`
- `go run ./cmd/kernel gc-docs`
- `go run ./cmd/kernel gc-structure`
- `go run ./cmd/kernel gc-ledger`
- `go run ./cmd/kernel experiment --vector docs-hygiene --baseline-ref codex/exp-baseline-20260312031225 --candidate-ref codex/exp-candidate-20260312031225`

Environment caveat:
- `make ...` commands still exit early on this machine because `/usr/bin/make` is blocked until the Xcode license is accepted. CI should not have that macOS-specific issue.

## Idempotence and Recovery
- Use small additive edits and rerunnable scripts; artifacts should be written with deterministic paths and UTC timestamps.
- Promotion stays conservative: `promote` should require a promotable ledger result and use fast-forward merge only.
- `revert` must never delete data by default; any branch cleanup requires an explicit flag.
- If a phase regresses validation, fix forward immediately and record the failed command plus artifact path in this plan.

## Interfaces and Dependencies
- Shell entrypoints: `make`, Bash scripts in `scripts/`
- Required binaries: `bash`, `git`, `go`, `curl`
- Go standard-library areas expected for kernel/runtime: `encoding/json`, `flag`, `net/http`, `os/exec`, `path/filepath`, `testing`, `time`
- Output locations: `docs/generated/improvement/`, `.tmp/runtime/`, `improvement/ledger/experiments/`

## Artifacts and Notes
- Baseline evidence index: `docs/generated/improvement/README.md`
- Baseline run capture: `docs/generated/improvement/phase-0-baseline.md`
- Host-environment note: final validation should prefer committed repo entrypoints, but local `make` verification may require a non-system `make` binary or accepted Xcode license on macOS.
- Score artifacts:
  - `docs/generated/improvement/docs-hygiene-baseline.json`
  - `docs/generated/improvement/docs-hygiene-score.json`
  - `docs/generated/improvement/runtime-smoke.json`
  - `docs/generated/improvement/runtime-boot-score.json`
- GC artifacts:
  - `docs/generated/improvement/gc-doc-gardening.json`
  - `docs/generated/improvement/gc-file-size-scan.json`
  - `docs/generated/improvement/gc-ledger-summary.json`
- Experiment artifacts:
  - `docs/generated/improvement/experiments/`
  - `improvement/ledger/experiments/2026-03-12T03-12-31Z-docs-hygiene-codex-exp-candidate-20260312031225.json`
- Temporary local refs created for experiment validation:
  - `codex/exp-baseline-20260312031225`
  - `codex/exp-candidate-20260312031225`
