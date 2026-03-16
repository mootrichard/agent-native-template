# Garbage collection (drift control)
Owner: Repo Maintainers
Last verified: 2026-03-16

Agents will replicate patterns that exist. Drift is inevitable unless we clean continuously.

## Implemented maintenance commands
- `deno task gc-docs` — stale-doc scan based on `Last verified`
- `deno task gc-structure` — tracked file size scan

## What each command writes
- `deno task gc-docs` writes `.tmp/improvement/gc-doc-gardening.json`
- `deno task gc-structure` writes `.tmp/improvement/gc-file-size-scan.json`

## Scheduling
- `.github/workflows/nightly-maintenance.yml` runs the GC commands on a schedule.
- The workflow is report-only: it uploads transient artifacts and does not auto-open PRs or merge
  anything.

## Operating rule
Corrections are cheap; waiting is expensive.
Prefer frequent small cleanup changes backed by reports and clear evidence.
