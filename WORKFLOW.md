# WORKFLOW.md

Owner: Repo Maintainers
Last verified: 2026-03-16

## Purpose of the Constitutional Layer

This file defines the repository rules that should change rarely and only deliberately. `AGENTS.md`
stays a short map; `WORKFLOW.md` holds the protected operating policy for the baseline starter:
scorecards, validation, runtime evidence, and doc guardrails.

## Protected Files and Paths

Protected paths require an ExecPlan update and an explicit rationale before editing:

- `AGENTS.md`
- `WORKFLOW.md`
- `ARCHITECTURE.md`
- `docs/**`
- `scorecards/**`
- `scripts/validate-docs.sh`
- `cmd/kernel.ts`
- `internal/kernel/**`
- `fixtures/runtime/**`
- `internal/runtimefixture/**`
- `.github/workflows/**`
- `.github/pull_request_template.md`

Protected files define the starter contract. Simplify them cautiously and prefer making policy more
checkable over adding more prose.

## Editable Scopes by Vector

- `docs-hygiene` Scope: `AGENTS.md`, `WORKFLOW.md`, `ARCHITECTURE.md`, `README.md`, `docs/**`,
  `scripts/validate-docs.sh`, `scorecards/docs-hygiene.json` Goal: reduce structural doc failures
  without weakening enforcement.
- `runtime-boot` Scope: `fixtures/runtime/**`, `internal/runtimefixture/**`, `scripts/dev.sh`,
  `scripts/smoke.sh`, `scripts/install-deps.sh`, `docs/OBSERVABILITY.md`, `docs/RELIABILITY.md`,
  `docs/scorecards/runtime-boot.md`, `scorecards/runtime-boot.json` Goal: improve local bootability
  and runtime evidence without adding framework or cloud dependencies.
- Constitutional/core-starter work Scope: protected files only when a human explicitly requests a
  starter-contract rewrite. Goal: keep the baseline command surface, docs, and scorecards coherent
  and conservative.

## Human Escalation Policy

Escalate only for:

- product intent conflicts,
- security/privacy tradeoffs,
- changes that weaken baseline validation or doc guardrails,
- destructive cleanup beyond the documented safe defaults.

Otherwise, propose the decision in the ExecPlan, implement it, validate it, and record evidence.

## Baseline Workflow Rules

- Respect each scorecard `budget_seconds`.
- Keep `deno task validate` fast; it is the canonical default loop.
- `deno task smoke` and `deno task score --vector <vector>` are optional supporting checks, not part
  of the baseline validation contract unless a task explicitly requires them.
- Prefer transient evidence under `.tmp/` for routine runs.

## Artifact Retention

- Keep `.tmp/` disposable local runtime and evidence state.
- Keep `docs/generated/` for explicitly published or historical reference artifacts only.
- Treat `.tmp/` as disposable local runtime/worktree state.
- Scheduled maintenance is report-only; it may upload transient artifacts but must not auto-open PRs
  or modify tracked files.

## Rules for Updating Scorecards

- Any scorecard change must update:
  - the JSON in `scorecards/`,
  - the prose doc in `docs/scorecards/`,
  - this file if editable scope changes.
- Scorecard changes must preserve mechanical readability: explicit metric, direction, guardrails,
  budget, and editable scope.
- Default scorecards should improve baseline developer leverage directly. Advanced governance
  workflows belong in optional extensions, not the starter contract.
