# Change Packages

Owner: Repo Maintainers
Last verified: 2026-03-13

This directory holds deterministic change packages generated from proposal artifacts.

## Layout

- `changes/<change-id>/change.json` — machine-readable summary of the change package
- `changes/<change-id>/proposal.md` — summary, signals, acceptance criteria, and evidence
- `changes/<change-id>/design.md` — boundaries and planned touchpoints
- `changes/<change-id>/tasks.md` — execution checklist and validation commands
- `changes/<change-id>/specs/<vector>.md` — delta spec for the targeted scorecard or workflow

## Rules

- Treat change packages as reviewable planning artifacts, not scratch notes.
- Refresh existing packages in place; do not fork incompatible layouts for the same `change-id`.
- Publishing to external trackers is intentionally out of scope for this template baseline.
