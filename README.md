# Agent-first repo starter
Owner: Repo Maintainers
Last verified: 2026-03-12

This repository is designed to be *built and maintained primarily by coding agents*.

The template now includes:
- a short map-style `AGENTS.md`
- protected constitutional policy in `WORKFLOW.md`
- executable scorecards
- a minimal improvement kernel with an append-only ledger
- a bootable disposable runtime fixture

## Quickstart
1. `deno task`
2. `deno task install`
3. `deno task test`
4. `deno task validate`
5. `deno task baseline --vector docs-hygiene`
6. `deno task score --vector runtime-boot`
7. `deno task experiment --vector runtime-boot --candidate-ref <branch>`

## Working model
- Read `AGENTS.md`, `WORKFLOW.md`, and `docs/index.md`.
- Create or refresh an ExecPlan for non-trivial work.
- Keep changes small, run the smallest relevant checks, and record artifacts.
- Use scorecards and the ledger for scoped improvement work.

## Main commands
- `deno task install` verifies `deno`, `git`, and `curl`.
- `deno task dev` boots the local runtime fixture from `fixtures/runtime/`.
- `deno task smoke` validates health, metrics, and logs.
- `deno task baseline --vector <scorecard>` captures the current vector baseline.
- `deno task score --vector <scorecard>` writes a machine-readable score artifact.
- `deno task experiment --vector <scorecard> --candidate-ref <ref>` compares refs and appends a ledger entry.

## Key references
- `WORKFLOW.md`
- `docs/index.md`
- `docs/product-specs/index.md`
- `docs/skills/index.md`
- `docs/scorecards/index.md`
