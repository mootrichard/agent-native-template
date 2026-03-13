# PR Review Merge Harness

Owner: Repo Maintainers
Last verified: 2026-03-13

## Goal

Compile PR review and merge governance into executable legality checks so future execution systems
can fail closed instead of relying on prompt-only instructions.

## Inputs

A PR review or merge harness should inspect:

- project registry entry
- risk tier and merge policy
- changed paths or protected-path matches
- validation and scorecard results
- evidence artifacts referenced by the PR
- approval state and required reviewers

## Decision points

Use harness checks at three stages:

1. Before PR creation Verify branch shape, required evidence, and validation preconditions.
2. Before review handoff Verify the PR contains the required summary, metrics, and artifact
   references.
3. Before merge or auto-merge Verify approvals, risk tier, protected-path rules, and whether
   auto-merge is legal.

## Verdicts

Recommended verdicts:

- `allow`
- `reject_retryable`
- `escalate_human`

`reject_retryable` should explain what evidence or precondition is missing so the next action can be
targeted instead of random.

## Default legality checks

Seed checks should cover:

- allowed branch patterns
- forbidden path edits for low-risk or auto-merge flows
- required scorecards and validation commands
- required PR evidence sections and artifact paths
- approval rules by risk tier
- explicit auto-merge allow or deny policy
