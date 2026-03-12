# Docs Hygiene Scorecard
Owner: Repo Maintainers
Last verified: 2026-03-12

## What this vector measures
`docs-hygiene` turns the repository's structural doc rules into an executable scorecard.
It measures the count of docs-validator failures and targets `failure_count` with direction `min`.

## What counts as regression
- Any increase in `failure_count`
- Any non-zero validator exit code
- Missing score artifact output

## Files in scope
- `AGENTS.md`
- `WORKFLOW.md`
- `ARCHITECTURE.md`
- `README.md`
- `docs/**`
- `scripts/validate-docs.sh`

## Artifacts
- `docs/generated/improvement/docs-hygiene-score.json`
- `docs/generated/improvement/docs-hygiene-baseline.json`

## Operating notes
- Run `deno task score --vector docs-hygiene` for the current score.
- Run `deno task baseline --vector docs-hygiene` before a docs-focused change set.
- Run `deno task experiment --vector docs-hygiene --candidate-ref <ref>` to compare refs and write a ledger entry.
