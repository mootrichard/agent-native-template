# Review And Merge Governance

Owner: Repo Maintainers
Last verified: 2026-03-13

## Goal

Self-improving repos still need a governed review flow. Review and merge policy is part of the
harness, not an external afterthought.

## Risk tiers

Projects should define risk tiers and map them to approval requirements.

Recommended defaults:

- `safe`: docs, tests, lint rules, and low-risk observability polish; green checks plus optional
  auto-merge when explicitly enabled
- `moderate`: build scripts, tooling, and non-user-facing automation; require one human approval
- `risky`: runtime logic, APIs, scheduler behavior, or guardrail changes; require two human
  approvals or an owner approval
- `critical`: auth, secrets, destructive infra, constitutional policy, or merge-rule changes; manual
  execution and manual merge only

## PR evidence contract

Every improvement PR should make review cheap.

Recommended sections:

- improvement summary
- baseline metric
- candidate metric
- guardrail results
- validation commands
- evidence artifact paths
- governance or approval requirement

## Relationship to the template

- `projects/registry.json` provides the default risk tier and merge-policy map.
- `.github/pull_request_template.md` seeds the review evidence structure.
- The next layer is an explicit review or merge harness that compiles these rules into legality
  checks.
