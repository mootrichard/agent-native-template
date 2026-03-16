# Docs Hygiene Scorecard

Owner: Repo Maintainers
Last verified: 2026-03-16

## What this vector measures

`docs-hygiene` turns the repository's structural doc rules into an executable scorecard. It measures
the count of docs-validator failures and targets `failure_count` with direction `min`.

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

- `.tmp/improvement/docs-hygiene-score.json`

## Operating notes

- Run `deno task score --vector docs-hygiene` for the current score.
- Use `deno task publish-artifact --from .tmp/improvement/docs-hygiene-score.json --to <path>` only
  when you intentionally want a versioned copy of the latest score.
