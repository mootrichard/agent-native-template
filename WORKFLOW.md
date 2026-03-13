# WORKFLOW.md

Owner: Repo Maintainers
Last verified: 2026-03-13

## Purpose of the Constitutional Layer

This file defines the repository rules that should change rarely and only deliberately. `AGENTS.md`
stays a short map; `WORKFLOW.md` holds the protected operating policy for scorecards, experiments,
promotion, rollback, and artifact handling.

## Protected Files and Paths

Protected paths require an ExecPlan update and an explicit rationale before editing:

- `AGENTS.md`
- `WORKFLOW.md`
- `ARCHITECTURE.md`
- `docs/**`
- `scorecards/**`
- `scripts/validate-docs.sh`
- `scripts/score-contracts.ts`
- `cmd/kernel/**`
- `internal/kernel/**`
- `projects/registry.json`
- `changes/**`
- `.github/pull_request_template.md`
- `fixtures/runtime/**`
- `internal/runtimefixture/**`
- `improvement/ledger/**`

Kernel changes are allowed when a human explicitly asks for constitutional or improvement-kernel
work. Routine vector experiments should not mutate protected kernel files.

## Editable Scopes by Vector

- `docs-hygiene` Scope: `AGENTS.md`, `WORKFLOW.md`, `ARCHITECTURE.md`, `README.md`, `docs/**`,
  `scripts/validate-docs.sh`, `scorecards/docs-hygiene.json` Goal: reduce structural doc failures
  without weakening enforcement.
- `runtime-boot` Scope: `fixtures/runtime/**`, `internal/runtimefixture/**`, `scripts/dev.sh`,
  `scripts/smoke.sh`, `scripts/install-deps.sh`, `docs/OBSERVABILITY.md`, `docs/RELIABILITY.md`,
  `docs/scorecards/runtime-boot.md`, `scorecards/runtime-boot.json` Goal: improve local bootability
  and runtime evidence without adding framework or cloud dependencies.
- `automation-harness-health` Scope: `README.md`, `WORKFLOW.md`, `ARCHITECTURE.md`, `deno.json`,
  `cmd/kernel.ts`, `internal/kernel/**`, `scripts/score-contracts.ts`, `projects/registry.json`,
  `changes/**`, `.github/pull_request_template.md`, `docs/product-specs/**`,
  `docs/scorecards/automation-harness-health.md`, `docs/generated/improvement/README.md`,
  `docs/LINTS.md`, `docs/QUALITY_SCORE.md`, `docs/skills/experiment-loop.md`,
  `scorecards/automation-harness-health.json` Goal: keep the template's proposal, change-package,
  registry, and review-handoff contracts explicit and mechanically verifiable.
- Constitutional/kernel work Scope: protected files only when a human explicitly requests a
  constitutional rewrite or kernel change. Goal: keep the comparison logic, policy, and append-only
  ledger conservative and auditable.

## Human Escalation Policy

Escalate only for:

- product intent conflicts,
- security/privacy tradeoffs,
- promotion of a candidate that requires weakening guardrails,
- destructive cleanup beyond the documented safe defaults.

Otherwise, propose the decision in the ExecPlan, implement it, validate it, and record evidence.

## Experiment Budgets

- Respect each scorecard `budget_seconds`.
- Prefer one vector at a time and small candidate diffs.
- Stop and reject when a candidate needs broader edits than the vector scope allows.
- Keep `deno task test` and `deno task validate` fast; runtime smoke and experiments stay separate
  when they would slow the default loop.

## Promotion Rules

- `non_regressing`: candidate target metric must not worsen and all guardrails must pass.
- `strict_improving`: candidate target metric must improve and all guardrails must pass.
- Promotion uses `git merge --ff-only` only.
- Missing metrics, missing artifacts, or failed guardrails are treated conservatively as
  non-promotable.

## Rollback Rules

- `deno task revert` records a rejection artifact; it does not destroy data by default.
- Candidate branches are deleted only with an explicit flag.
- Ledger entries are append-only. Rejections add new artifacts; they do not rewrite history.
- If a protected-file change regresses validation, fix forward or revert the change in a new
  commit/branch; do not silently delete evidence.

## Artifact Retention

- Keep ledger entries under `improvement/ledger/experiments/` indefinitely.
- Keep the latest generated score/smoke/proposal artifacts under `docs/generated/improvement/`.
- Treat `.tmp/` as disposable local runtime/worktree state.
- Scheduled maintenance is report-only in v1; it may upload artifacts but must not auto-merge or
  auto-open PRs.

## Rules for Updating Scorecards and Ledger Entries

- Any scorecard change must update:
  - the JSON in `scorecards/`,
  - the prose doc in `docs/scorecards/`,
  - this file if editable scope or promotion policy changes.
- Scorecard changes must preserve mechanical readability: explicit metric, direction, guardrails,
  budget, and editable scope.
- Ledger entries are JSON, append-only, and created by tooling. Do not hand-edit historical entries
  unless a follow-up ledger artifact explains the correction.
- New vectors should start with a minimal, auditable evaluator before broader automation is added.
