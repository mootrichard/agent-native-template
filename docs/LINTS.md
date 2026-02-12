# Mechanical enforcement (lints, structural tests, doc checks)
Owner: Repo Maintainers
Last verified: 2026-02-12

## Goal
Encode constraints so agents can move fast without architectural drift.

## What we enforce (starter list)
- Architecture boundaries (dependency direction rules)
- Naming conventions for schemas/types
- Structured logging usage
- File size limits (keep modules context-loadable)
- Docs structure correctness (see below)
- CI must run fast, locally and in CI

## Docs lints (knowledge base hygiene)
- Every doc is reachable from `docs/index.md` (directly or via an index).
- `docs/design-docs/index.md` lists all design docs with status.
- ExecPlans live only in `docs/exec-plans/{active,completed}`.
- Stale-doc detection:
  - docs must declare an “owner” (team or role),
  - docs must declare a “last verified” date,
  - docs older than 180 days trigger a “doc gardening” issue/PR.

## Baseline enforcement command
- Run `make docs-lint` (or `./scripts/validate-docs.sh`) to enforce this file's docs hygiene rules.
- `make test` and `make validate` run this baseline check by default.

## How to evolve enforcement
If you see repeated failures:
1. Add a lint or test that prevents the failure.
2. Write the lint error message as remediation instructions.
3. Add a short doc update explaining the invariant.
