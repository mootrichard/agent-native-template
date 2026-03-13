# Per Project Harness Model

Owner: Repo Maintainers
Last verified: 2026-03-13

## Goal

Each seeded project should be able to grow a project-local harness that captures how an execution
system is allowed to act inside the repo.

## Responsibilities

A project harness should be able to:

- evaluate whether a proposed action is legal for the current project and workflow phase
- explain rejection reasons in a structured form that supports retry or escalation
- declare which validations, scorecards, and evidence artifacts are required
- replace narrow, stable workflows with deterministic code when the project is ready

## Modes

Use a staged adoption model:

- `filter`: reject obviously illegal actions before they run
- `verifier`: allow a proposed action, then reject and retry when legality checks fail
- `policy`: replace a narrow, stable workflow with deterministic code when the task is routine
  enough

## Outputs

Harness checks should produce structured results instead of plain text.

Minimum fields:

- `verdict`: `allow`, `reject_retryable`, or `escalate_human`
- `reason`: short machine-readable code
- `details`: human-readable explanation
- `required_evidence`: optional list of missing artifacts or checks

## Boundaries

- A harness is project-local policy, not a substitute for shared repo policy.
- Protected-path and constitutional rules still live in repo policy and may only be weakened through
  governed review.
- Broad system behavior still belongs in versioned code and docs, not buried in prompts.
