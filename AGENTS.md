# AGENTS.md (root)
Owner: Repo Maintainers
Last verified: 2026-03-16

You are a coding agent working in this repository.
This file is intentionally short. It is a map to deeper sources of truth in `docs/`.

## Prime directive
Optimize for: correctness, legibility-to-agents, and mechanical verifiability.
If you’re unsure, make the system *more checkable*, not more clever.

## Operating loop
1. Start at `docs/index.md`.
2. Read `WORKFLOW.md` before changing protected files.
3. Create or refresh an ExecPlan in `docs/exec-plans/active/` for non-trivial work.
4. Work in small steps, run the smallest relevant check, and record evidence.

## Core commands
- `deno task`
- `deno task install`
- `deno task validate`
- `deno task smoke`
- `deno task score --vector <scorecard>`
- `deno task gc-docs`
- `deno task gc-structure`
- `deno task publish-artifact --from <path> --to <path>`

## Repository knowledge is the system of record
- Do NOT rely on external docs, chat history, or “tribal knowledge”.
- If a decision matters, encode it in `docs/` (or in code/tests).
- Prefer updating docs + adding a linter/check over adding a “note to self”.

## Pointers
- Knowledge base entrypoint: `docs/index.md`
- Constitutional policy: `WORKFLOW.md`
- Plans: `docs/PLANS.md` + `docs/exec-plans/`
- Scorecards: `scorecards/` + `docs/scorecards/`
- Product specs: `docs/product-specs/`
- Repo skills: `docs/skills/`
- Architecture map: `ARCHITECTURE.md`
- Guardrails: `docs/LINTS.md` + `docs/QUALITY_SCORE.md`
- Reliability/perf: `docs/RELIABILITY.md`
- Security: `docs/SECURITY.md`
- Cleanup/GC cadence: `docs/GC.md`
