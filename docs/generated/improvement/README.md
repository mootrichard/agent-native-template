# Improvement Artifacts

Owner: Repo Maintainers
Last verified: 2026-03-16

This directory stores historical or intentionally published improvement artifacts.
Routine smoke, score, and GC outputs should stay under `.tmp/improvement/`.

## Contents

- `phase-0-baseline.md` — baseline behavior before the improvement-kernel rewrite

## Conventions

- Prefer UTC timestamps.
- Keep artifact names stable and scoped by workflow/vector.
- Publish files here explicitly with `deno task publish-artifact --from <path> --to <path>`.
- Do not hand-edit machine-written artifacts unless a doc explicitly says otherwise.
