# Agent-first repo starter

Owner: Repo Maintainers
Last verified: 2026-03-16

This repository is designed to be _built and maintained primarily by coding agents_.

The template now includes:

- a short map-style `AGENTS.md`
- protected constitutional policy in `WORKFLOW.md`
- a single canonical validation loop
- executable scorecards for docs hygiene and runtime boot
- a bootable disposable runtime fixture
- transient-by-default evidence under `.tmp/`

## Quickstart

1. `deno task`
2. `deno task install`
3. `deno task validate`
4. `deno task smoke`
5. Optional: `deno task score --vector docs-hygiene`
6. Optional: `deno task score --vector runtime-boot`

## Working model

- Read `AGENTS.md`, `WORKFLOW.md`, and `docs/index.md`.
- Create or refresh an ExecPlan for non-trivial work.
- Keep changes small and run the canonical validation loop early.
- Treat `.tmp/` evidence as disposable unless you explicitly publish a versioned copy.
- Add heavier governance or self-improvement machinery only when a real project proves it is worth
  the maintenance cost.

## Main commands

- `deno task install` verifies the baseline shell/runtime prerequisites.
- `deno task dev` boots the local runtime fixture from `fixtures/runtime/`.
- `deno task validate` runs the canonical fast loop.
- `deno task smoke` validates health, metrics, logs, and transient runtime evidence.
- `deno task score --vector <scorecard>` writes a transient score artifact under `.tmp/improvement/`.
- `deno task publish-artifact --from <path> --to <path>` makes versioned evidence explicit.

## Key references

- `WORKFLOW.md`
- `docs/index.md`
- `docs/product-specs/index.md`
- `docs/skills/index.md`
- `docs/scorecards/index.md`
- `docs/design-docs/index.md`
