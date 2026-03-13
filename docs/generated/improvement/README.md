# Improvement Artifacts

Owner: Repo Maintainers
Last verified: 2026-03-13

This directory stores generated evidence for the template's self-improvement loop. Artifacts here
should be machine-readable or concise human-readable summaries produced by repository tooling.

## Contents

- `phase-0-baseline.md` — baseline behavior before the improvement-kernel rewrite
- `docs-hygiene-score.json` — latest docs-hygiene score artifact
- `runtime-smoke.json` — latest runtime smoke artifact
- `runtime-boot-score.json` — latest runtime-boot score artifact
- `automation-harness-health-score.json` — latest automation contract score artifact
- `*-proposal.json` — latest structured proposal artifact for a vector

## Conventions

- Prefer UTC timestamps.
- Keep artifact names stable and scoped by workflow/vector.
- Do not hand-edit machine-written JSON artifacts unless a doc explicitly says otherwise.
