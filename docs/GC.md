# Garbage collection (drift control)
Owner: Repo Maintainers
Last verified: 2026-03-12

Agents will replicate patterns that exist. Drift is inevitable unless we clean continuously.

## Implemented maintenance commands
- `deno task gc-docs` — stale-doc scan based on `Last verified`
- `deno task gc-structure` — tracked file size scan
- `deno task gc-ledger` — experiment ledger summary

## What each command writes
- `deno task gc-docs` writes `docs/generated/improvement/gc-doc-gardening.json`
- `deno task gc-structure` writes `docs/generated/improvement/gc-file-size-scan.json`
- `deno task gc-ledger` writes `docs/generated/improvement/gc-ledger-summary.json`

## Scheduling
- `.github/workflows/nightly-maintenance.yml` runs the GC commands on a schedule.
- The workflow is report-only in v1: it uploads artifacts and does not auto-open PRs or merge anything.

## Operating rule
Corrections are cheap; waiting is expensive.
Prefer frequent small cleanup changes backed by reports and clear evidence.
