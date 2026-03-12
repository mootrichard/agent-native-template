# Phase 0 Baseline
Owner: Repo Maintainers
Last verified: 2026-03-12

This file records the repository baseline before the improvement-kernel rewrite changes behavior.

## Status
Baseline captured on 2026-03-12.

## `make` Baseline
- `make install`
  Observed result: failed before repo code ran.
  Exit code: `69`
  Output: `You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license'...`
- `make dev`
  Observed result: failed before repo code ran.
  Exit code: `69`
  Output: `You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license'...`
- `make test`
  Observed result: failed before repo code ran.
  Exit code: `69`
  Output: `You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license'...`
- `make validate`
  Observed result: failed before repo code ran.
  Exit code: `69`
  Output: `You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license'...`

## Gap Summary
The repo already has the constitutional layer:
- short map-style `AGENTS.md`
- docs-first system of record under `docs/`
- a lightweight docs validator
- one fast validation loop

The repo does not yet have the improvement kernel:
- no `WORKFLOW.md` constitutional policy file
- no executable scorecards
- no experiment compare/promote/revert loop
- no append-only ledger
- no bootable runtime fixture
- no runtime scorecard
- no executable recurring GC commands

## Direct Script Baseline
- `./scripts/install-deps.sh`
  Exit code: `0`
  Output: `No dependency install is required for the base template. Seeded projects should extend this target with stack-specific setup.`
- `./scripts/dev.sh`
  Exit code: `0`
  Output: `No runtime application is scaffolded yet. Use this template to initialize governance, then add stack-specific dev startup here.`
- `./scripts/test.sh`
  Exit code: `0`
  Output summary: docs metadata, reachability, design-doc, and ExecPlan placement checks passed.
- `./scripts/validate.sh`
  Exit code: `0`
  Output summary: same fast docs validation loop passed.

## Evidence Paths
- `docs/generated/improvement/README.md`
- `docs/exec-plans/active/rewrite-template-improvement-kernel.md`
