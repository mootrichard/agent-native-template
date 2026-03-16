# Docs Hygiene Skill
Owner: Repo Maintainers
Last verified: 2026-03-16

## When to use it
Use this skill when changing policy docs, indexes, design docs, or any repo knowledge-base content.

## Exact commands
- `deno task validate`
- `deno task docs-lint`
- `deno task score --vector docs-hygiene`

## Expected observations
- Docs metadata, reachability, design-doc indexing, and ExecPlan placement all pass.
- `.tmp/improvement/docs-hygiene-score.json` is written when the score command runs.

## Common failures
- Missing `Owner:` or `Last verified:`
- A new doc is not reachable from `docs/index.md`
- A design doc is missing from `docs/design-docs/index.md`

## Recovery steps
- Add metadata.
- Update the nearest index doc.
- Re-run `deno task docs-lint` first, then `deno task score --vector docs-hygiene`.
