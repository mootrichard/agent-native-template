# ARCHITECTURE

Owner: Repo Maintainers
Last verified: 2026-03-16

This document is a _map_, not a manual. It should stay relatively stable over time.

## What this repo is

An agent-first repository template with a small constitutional layer, executable scorecards for the
baseline starter, and a disposable local runtime fixture.

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
- Explicitly published evidence:
  - `docs/generated/`
- Transient evidence:
  - `.tmp/improvement/`

## Architectural invariants (must not drift)

1. Keep `AGENTS.md` short and map-like; policy belongs in `WORKFLOW.md`.
2. `docs/` remains the system of record for decisions, specs, and procedures.
3. Scorecards stay machine-readable and conservative.
4. Runtime observability is direct and local-first: structured logs, simple metrics, correlation
   ids.
5. Routine validation must not dirty tracked files.
6. Heavier governance or self-improvement machinery is optional and should justify its own cost.

## Cross-cutting concerns

- Testing, linting, and score artifacts are product features for agents.
- Runtime bootability is part of the template, not deferred to seeded projects.
- Scheduled GC is report-only and exists to prevent drift, not to auto-merge code.

## Where to learn more

Start at `docs/index.md`.
