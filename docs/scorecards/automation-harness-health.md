# Automation Harness Health Scorecard

Owner: Repo Maintainers
Last verified: 2026-03-13

## What this vector measures

`automation-harness-health` verifies that the template carries the planning and review contracts a
downstream system like Symphony needs in order to work safely inside a seeded repo. It measures
`missing_contracts` with direction `min`.

## Guardrails

- `contract_pass == true`
- `artifact_written == true`
- `required_contracts >= 10`

## Files in scope

- `README.md`
- `WORKFLOW.md`
- `ARCHITECTURE.md`
- `deno.json`
- `cmd/kernel.ts`
- `internal/kernel/**`
- `scripts/score-contracts.ts`
- `projects/registry.json`
- `changes/**`
- `.github/pull_request_template.md`
- `docs/product-specs/**`
- `docs/scorecards/automation-harness-health.md`
- `docs/scorecards/index.md`
- `docs/generated/improvement/README.md`
- `docs/LINTS.md`
- `docs/QUALITY_SCORE.md`
- `docs/skills/experiment-loop.md`
- `scorecards/automation-harness-health.json`

## Artifacts

- `.tmp/improvement/automation-harness-health.json`
- `docs/generated/improvement/automation-harness-health-score.json`
- `docs/generated/improvement/automation-harness-health-proposal.json`

## Operating notes

- Run `deno task score --vector automation-harness-health` to verify the registry, proposal,
  change-package, and PR evidence contracts.
- Run `deno task propose --vector automation-harness-health` to materialize a proposal artifact and,
  when needed, a deterministic change package.
- This vector stays repo-local by design: it checks planning and governance structure, not external
  tracker publication.
