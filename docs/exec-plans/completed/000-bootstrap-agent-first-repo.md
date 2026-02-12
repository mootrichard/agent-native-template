# Bootstrap the agent-first repo scaffold
Owner: Repo Maintainers
Last verified: 2026-02-12

## Purpose / Big Picture
Establish the foundational guardrails that let agents build quickly without architectural drift:
docs-as-truth, plans, initial architecture invariants, and hygiene checks.

## Progress
- [x] (2026-02-12 00:00Z) Add initial docs tree + indexes.
- [x] (2026-02-12 00:00Z) Add initial docs lint specification.
- [x] (2026-02-12 00:00Z) Define architecture boundaries and placeholder module layout.
- [x] (2026-02-12 00:00Z) Define minimal fast-check command convention.
- [x] (2026-02-12 00:00Z) Create first GC maintenance guidance.

## Surprises & Discoveries
- Observation: Initial scaffold focused on policy docs before executable validation existed.
  Evidence: Early AGENTS instructions referenced commands as placeholders.

## Decision Log
- Decision: Bootstrap as docs-first, then harden with executable checks in follow-up plans.
  Rationale: Keeps initial complexity low while preserving a clear path to mechanical enforcement.
  Date/Author: 2026-02-12 / Repo Maintainers

## Outcomes & Retrospective
- Established the base codemap and guardrail docs for an agent-first repository.
- Set conventions for planning (`docs/PLANS.md`, ExecPlan directories) and recurring cleanup (`docs/GC.md`).
- Follow-up hardening tracked separately in `docs/exec-plans/completed/001-harden-template-foundation.md`.

## Context and Orientation
Currently the repo contains only docs. The goal is to make future code additions guided by:
- AGENTS.md (map)
- ARCHITECTURE.md (codemap + invariants)
- docs/* (system of record)
- ExecPlans (multi-hour work)

## Plan of Work
1. Ensure docs are discoverable and indexed.
2. Add a doc lint spec describing what “valid docs” means.
3. Define an initial architectural layer model to enforce once code exists.
4. Add a GC cadence and tech debt tracker to prevent drift early.

## Concrete Steps
- Ensure all new docs are linked from `docs/index.md`.
- Ensure `docs/design-docs/index.md` catalogs design docs.
- Ensure ExecPlans live in `docs/exec-plans/active|completed`.

## Validation and Acceptance
- A new agent can start at `AGENTS.md` and navigate to:
  - the knowledge base,
  - the plan template,
  - the architecture invariants,
  - the cleanup cadence.
- All referenced files exist and are internally consistent.

## Idempotence and Recovery
Safe to rerun: this plan only adds/edit docs.

## Interfaces and Dependencies
None yet (docs-only).
