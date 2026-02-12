# Garbage collection (drift control)
Owner: Repo Maintainers
Last verified: 2026-02-12

Agents will replicate patterns that exist. Drift is inevitable unless we clean continuously.

## Golden principles (starter)
1. Prefer shared utilities over duplicated helpers (centralize invariants).
2. Don’t guess data shapes; parse/validate at boundaries.
3. Keep modules small and namespaced.
4. Turn recurring review comments into checks (docs/lints/tests).

## Recurring maintenance loops (examples)
- Doc gardening:
  - find stale docs, refresh or delete, update indexes.
- Quality sweep:
  - identify duplicated helpers, refactor into utilities.
  - reduce file size hotspots.
- Flake hunt:
  - detect flaky tests, quarantine + fix with priority.
- Architecture drift scan:
  - detect forbidden dependencies, propose refactors.

## Operating rule
Corrections are cheap; waiting is expensive.
Prefer frequent small cleanup PRs that are easy to review and safe to auto-merge.
