# ARCHITECTURE
Owner: Repo Maintainers
Last verified: 2026-02-12

This document is a *map*, not a manual.
It should stay relatively stable over time.

## What this repo is
An agent-first product repository. The primary goal is to make the system legible,
testable, and safe for autonomous iteration.

## Codemap (where is the thing?)
- `docs/`: system-of-record knowledge base
- `docs/exec-plans/`: executable plans (active/completed) + tech debt tracker
- `docs/design-docs/`: deeper design history and decisions
- `docs/generated/`: machine-generated artifacts (schemas, inventories)
- `docs/references/`: LLM-friendly references for tools/frameworks used here

(Implementation directories will be added as the product is built; keep them namespaced.)

## Architectural invariants (must not drift)
1. Clear boundaries between layers and domains.
2. Dependency direction is intentional and enforced mechanically.
3. Data is parsed/validated at boundaries; internal code assumes refined types.
4. Observability is first-class: logs/metrics/traces are queryable and used for validation.
5. Everything important is discoverable in-repo.

## Cross-cutting concerns
- Auth / connectors / telemetry / feature flags enter through explicit “provider” interfaces.
- Testing and linting are treated as product features for agents.
- Docs are validated via CI to prevent rot.

## Where to learn more
Start at `docs/index.md`.
