# Harden template foundation with executable checks
Owner: Repo Maintainers
Last verified: 2026-02-12

## Purpose / Big Picture
Convert the current docs-first scaffold from mostly aspirational guardrails into a mechanically verifiable template. The outcome should be that a newly seeded project can run one fast validation command and know whether its knowledge base and operating docs are healthy.

## Progress
- [x] (2026-02-12 04:25Z) Audit repository structure and detect drift against declared guardrails.
- [x] (2026-02-12 04:29Z) Add a minimal validation toolchain (`scripts/` + `Makefile`) with fast local commands.
- [x] (2026-02-12 04:29Z) Implement docs lint checks for index reachability, design-doc cataloging, exec-plan placement, and metadata hygiene.
- [x] (2026-02-12 04:30Z) Repair docs so the new checks pass.
- [x] (2026-02-12 04:30Z) Add CI workflow to run the same fast checks.
- [x] (2026-02-12 04:30Z) Run full validation and record evidence.

## Surprises & Discoveries
- Observation: Guardrails are well-defined, but there is no executable validation command in the repo yet.
  Evidence: `AGENTS.md` contains placeholder setup/run/test commands and no scripts/config files exist for lint/test execution.
- Observation: `docs/FRONTEND.md` exists but is not reachable from `docs/index.md`.
  Evidence: `docs/index.md` lists product and architecture docs but omits `docs/FRONTEND.md`.
- Observation: `docs/generated/db-schema.md` initially failed reachability under the new docs lint rules.
  Evidence: First `make validate` run reported: "docs/generated/db-schema.md is not reachable from docs/index.md..."

## Decision Log
- Decision: Implement checks as POSIX shell scripts plus a `Makefile` instead of language-specific tooling.
  Rationale: Keeps the template dependency-light and runnable before any product stack is chosen.
  Date/Author: 2026-02-12 / Codex
- Decision: Keep command targets stack-agnostic (`make install/dev/test/validate`) and intentionally avoid app runtime scaffolding.
  Rationale: This repository is a seed template for AI-native project governance, not a product runtime starter.
  Date/Author: 2026-02-12 / Codex

## Outcomes & Retrospective
Implemented:
- Baseline command surface via `Makefile` and `scripts/`.
- Enforced docs hygiene checks in `scripts/validate-docs.sh`.
- CI workflow at `.github/workflows/validate.yml` to run `make validate`.
- Concrete command guidance in `AGENTS.md` and `README.md`.

Validation evidence:
- `make validate` now passes end-to-end.

## Context and Orientation
- Entry guidance: `AGENTS.md`, `README.md`
- Knowledge base: `docs/index.md`
- Guardrail definitions: `docs/LINTS.md`, `docs/QUALITY_SCORE.md`
- Existing execution conventions: `docs/PLANS.md`, `docs/exec-plans/README.md`

## Plan of Work
1. Add command entrypoints (`make test`, `make validate`) and supporting scripts.
2. Encode doc invariants in `scripts/validate-docs.sh`.
3. Update docs/metadata to satisfy the checks.
4. Wire the checks to CI for template portability.
5. Verify all checks pass and record concrete command output.

## Concrete Steps
1. Create `scripts/validate-docs.sh`, `scripts/test.sh`, and `scripts/validate.sh`.
2. Add `Makefile` targets for install/dev/test/validate.
3. Update docs indexes and metadata lines (`Owner`, `Last verified`) where required.
4. Add `.github/workflows/validate.yml` to run `make validate`.
5. Run `make validate` locally.

## Validation and Acceptance
- `make test` succeeds and runs docs checks.
- `make validate` succeeds and includes all fast checks.
- `AGENTS.md` setup/run/test commands are concrete and runnable.
- Docs lint catches missing metadata/index coverage when intentionally violated.

## Idempotence and Recovery
- Scripts are safe to rerun repeatedly.
- If a check fails, fix docs/scripts and rerun `make validate`.
- No destructive operations are introduced.

## Interfaces and Dependencies
- Shell tooling: `bash`, `find`, `grep`, `sed`.
- Optional fast path: `rg` if available (fallback to `grep`).

## Artifacts and Notes
- This plan hardens only repository scaffolding and checks; no runtime application code is introduced.
