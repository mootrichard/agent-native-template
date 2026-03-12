# Experiment Loop Skill
Owner: Repo Maintainers
Last verified: 2026-03-12

## When to use it
Use this skill when a change should be evaluated against a baseline before promotion.

## Exact commands
- `deno task baseline --vector <vector>`
- `deno task score --vector <vector>`
- `deno task experiment --vector <vector> --candidate-ref <ref> [--baseline-ref <ref>]`
- `deno task promote`
- `deno task revert`

## Expected observations
- The experiment creates isolated worktrees under `.tmp/worktrees/`.
- A ledger entry is written under `improvement/ledger/experiments/`.
- Promotion succeeds only when the ledger verdict is `promote`.

## Common failures
- Candidate ref does not exist
- Score artifact not written in a worktree
- Candidate regresses the target metric or fails a guardrail

## Recovery steps
- Verify the candidate ref with `git rev-parse <ref>`.
- Run `deno task score --vector <vector>` on the candidate branch directly.
- Inspect the latest ledger entry and either fix the candidate or record a safe revert artifact.
