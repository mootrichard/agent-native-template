# Design (agent-first)
Owner: Repo Maintainers
Last verified: 2026-02-12

## Goal
Make the system *easy for an agent to understand and safely change*.

## Core principles
- **Legibility over cleverness:** optimize for discoverability and predictable structure.
- **Progressive disclosure:** the entry docs should point to deeper docs by topic.
- **Strict boundaries:** encode architecture so it’s enforceable, not aspirational.
- **Feedback loops:** tests + lints + observability + UI validation are the engine.
- **Repo-local truth:** decisions live in versioned artifacts, not external docs.

## “Taste invariants” (examples; enforce via lints/tests when possible)
- Structured logging (no ad-hoc string soups).
- Naming conventions for schemas/types.
- File size limits to prevent context truncation.
- Prefer small, well-scoped modules; “filesystem is an API”.

## Preferred tech choices (guidance)
Choose stable, boring, well-documented dependencies when possible.
If an external library is opaque or unstable, it may be cheaper to implement a small internal subset.

## How to add a new domain
1. Create a design doc in `docs/design-docs/` and add it to the index.
2. Define domain boundaries and dependency directions.
3. Add lints/structural tests to enforce the dependency graph.
4. Add quality and reliability expectations for that domain.
