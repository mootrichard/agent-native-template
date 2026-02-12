# Tech debt tracker
Owner: Repo Maintainers
Last verified: 2026-02-12

## How to use
- Add concrete, bounded items.
- Prefer “small, daily-paydown” tasks.
- Link to evidence: failing tests, flaky runs, lint violations, perf regressions.

## Items
- Add a docs lint that fails on unresolved path references in backticks (broken codemap links).
- Add a check that every active ExecPlan has at least one recent Progress timestamp.
- Add a lightweight template release checklist document before first public reuse.
