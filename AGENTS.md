# AGENTS.md (root)
Owner: Repo Maintainers
Last verified: 2026-02-12

You are a coding agent working in this repository.
This file is intentionally short. It is a map to deeper sources of truth in `docs/`.

## Prime directive
Optimize for: correctness, legibility-to-agents, and mechanical verifiability.
If you’re unsure, make the system *more checkable*, not more clever.

## Setup / run / test (template baseline)
- Install deps: `make install` (no-op by default; extend in seeded repos)
- Start dev: `make dev` (documents that runtime scaffold is not yet created)
- Run unit tests: `make test` (runs fast docs integrity checks)
- Run full validation: `make validate` (same fast baseline; extend as repo grows)

If commands are missing or slow, open a PR to add/fix them.

## How to work here (the loop)
1. Read the relevant docs (start at `docs/index.md`).
2. Create/refresh an ExecPlan for non-trivial work: `docs/exec-plans/active/*` (rules in `docs/PLANS.md`).
3. Work in small steps.
4. After each step: run the smallest relevant checks, fix failures, and record evidence.
5. Open a PR with:
   - clear purpose,
   - what changed,
   - how it was validated,
   - any follow-ups (if needed).

## Repository knowledge is the system of record
- Do NOT rely on external docs, chat history, or “tribal knowledge”.
- If a decision matters, encode it in `docs/` (or in code/tests).
- Prefer updating docs + adding a linter/check over adding a “note to self”.

## Architecture invariants (high-level)
- Follow `ARCHITECTURE.md` and `docs/DESIGN.md`.
- Enforce boundaries with code + tests + linters (see `docs/LINTS.md`).
- Validate/parse data at system boundaries (see `docs/SECURITY.md`).

## Quality bar (non-negotiables)
- Add/adjust tests for every behavior change.
- Keep files small and well-namespaced; filesystem is a navigation interface (see `docs/QUALITY_SCORE.md`).
- Prefer boring, legible solutions over clever abstractions.

## When to escalate to humans
Escalate only when judgment is required (product intent conflict, risky security tradeoff, unclear acceptance).
Otherwise: propose a decision in the plan, implement, validate, and ship.

## Pointers
- Knowledge base entrypoint: `docs/index.md`
- Plans: `docs/PLANS.md` + `docs/exec-plans/`
- Architecture map: `ARCHITECTURE.md`
- Guardrails: `docs/LINTS.md` + `docs/QUALITY_SCORE.md`
- Reliability/perf: `docs/RELIABILITY.md`
- Security: `docs/SECURITY.md`
- Cleanup/GC cadence: `docs/GC.md`
