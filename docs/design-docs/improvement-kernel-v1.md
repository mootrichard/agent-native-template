# Improvement kernel v1
Owner: Repo Maintainers
Last verified: 2026-03-12

## Status
Accepted

## Context
The template already enforced docs hygiene, but it could not boot itself, score runtime behavior, compare candidate refs, or retain experiment history. Future agents would still need external chat context to know how improvement should work.

## Decision
Add a minimal self-improvement kernel made of:
- one protected constitutional policy file (`WORKFLOW.md`)
- machine-readable scorecards in `scorecards/`
- a small TypeScript runtime fixture
- baseline/score/experiment/promote/revert commands plus Bash entrypoints
- an append-only ledger in `improvement/ledger/experiments/`
- repo-local product specs, skills, and maintenance scripts

## Alternatives Considered
- Build a generic adapter/plugin system now.
  Rejected because the template needs auditable fixed vectors first.
- Add a dashboard or external observability stack.
  Rejected because the brief requires zero framework/cloud coupling and fast local loops.

## Consequences / Tradeoffs
- The kernel stays intentionally small and explicit, but vector support is hard-coded for now.
- Generated evidence becomes a first-class artifact that agents must maintain.
- Runtime capability is real but intentionally minimal; seeded projects extend it later.

## Enforcement Plan
- Protect policy and kernel files in `WORKFLOW.md`.
- Validate docs structure with `scripts/validate-docs.sh`.
- Encode executable vectors in `scorecards/*.json`.
- Keep experiments append-only through JSON ledger entries.

## Verification Notes
- `deno task baseline --vector docs-hygiene`
- `deno task score --vector docs-hygiene`
- `deno task smoke`
- `deno task score --vector runtime-boot`
- `deno task experiment --vector docs-hygiene --candidate-ref <ref>`
