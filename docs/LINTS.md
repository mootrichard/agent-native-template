# Mechanical enforcement (lints, structural tests, doc checks)
Owner: Repo Maintainers
Last verified: 2026-03-12

## Goal
Encode constraints so agents can move fast without architectural drift.

## What we enforce
- Docs metadata, reachability, design-doc indexing, and ExecPlan placement
- Scorecard artifacts for `docs-hygiene` and `runtime-boot`
- Unit tests for kernel comparison/ledger behavior
- Runtime smoke validation as a separate fast check
- File-size and stale-doc scans via executable GC scripts

## Docs lints (knowledge base hygiene)
- Every doc is reachable from `docs/index.md` (directly or via an index).
- `docs/design-docs/index.md` lists all design docs with status.
- ExecPlans live only in `docs/exec-plans/{active,completed}`.
- `WORKFLOW.md` is treated like the other protected root docs and must carry metadata.
- Stale-doc detection:
  - docs must declare an “owner” (team or role),
  - docs must declare a “last verified” date,
  - docs older than 180 days are reported by `deno task gc-docs`.

## Baseline enforcement commands
- `deno task docs-lint` or `./scripts/validate-docs.sh`
- `deno task test`
- `deno task validate`
- `deno task score --vector docs-hygiene`
- `deno task score --vector runtime-boot`

## How to evolve enforcement
If you see repeated failures:
1. Add a lint or test that prevents the failure.
2. Write the lint error message as remediation instructions.
3. Add a short doc update explaining the invariant.
