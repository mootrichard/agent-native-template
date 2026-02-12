# Agent-first repo starter
Owner: Repo Maintainers
Last verified: 2026-02-12

This repository is designed to be *built and maintained primarily by coding agents*.

Humans set direction, constraints, and acceptance criteria. Agents:
- implement features,
- write tests and docs,
- update CI and tooling,
- run validation loops,
- open PRs, respond to review, and (optionally) merge.

## Where to start (humans)
- Read `AGENTS.md` (high-level map for agents).
- Read `docs/index.md` (the repo’s “system of record” knowledge base).
- Create or update a plan in `docs/exec-plans/active/` for any non-trivial work.
- Use PRs for everything.

## Validation loop (template baseline)
- `make install` — baseline setup (currently no-op)
- `make test` — runs fast docs integrity checks
- `make validate` — full fast validation (same baseline, extend as code is added)

## Where to start (agents)
- Read `AGENTS.md` and follow it literally.
- Treat `docs/` as ground truth. If something important is not in the repo, it effectively does not exist.
- Prefer small PRs with clear validation evidence.

## Philosophy (one paragraph)
Speed without decay comes from: strict structure, strong guardrails, and continuous cleanup.
