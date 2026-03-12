# ARCHITECTURE
Owner: Repo Maintainers
Last verified: 2026-03-12

This document is a *map*, not a manual.
It should stay relatively stable over time.

## What this repo is
An agent-first repository template with its own constitutional policy, executable scorecards,
minimal runtime fixture, and append-only self-improvement loop.

## Codemap (where is the thing?)
- Constitutional layer:
  - `AGENTS.md`
  - `WORKFLOW.md`
  - `ARCHITECTURE.md`
- Knowledge base:
  - `docs/`
  - `docs/design-docs/`
  - `docs/product-specs/`
  - `docs/skills/`
  - `docs/scorecards/`
- Executable layer:
  - `scorecards/`
  - `scripts/`
  - `cmd/kernel.ts`
  - `internal/kernel/`
  - `tests/`
- Runtime fixture:
  - `fixtures/runtime/main.ts`
  - `internal/runtimefixture/`
  - `.tmp/runtime/` (local only)
- Improvement evidence:
  - `docs/generated/improvement/`
  - `improvement/ledger/experiments/`

## Architectural invariants (must not drift)
1. Keep `AGENTS.md` short and map-like; policy belongs in `WORKFLOW.md`.
2. `docs/` remains the system of record for decisions, specs, and procedures.
3. Scorecards stay machine-readable and conservative; promotion is non-regressing or stricter.
4. Runtime observability is direct and local-first: structured logs, simple metrics, correlation ids.
5. Experiment history is append-only and auditable.

## Cross-cutting concerns
- Testing, linting, and score artifacts are product features for agents.
- Runtime bootability is part of the template, not deferred to seeded projects.
- Scheduled GC is report-only in v1 and exists to prevent drift, not to auto-merge code.

## Where to learn more
Start at `docs/index.md`.
