# Runtime Smoke Skill
Owner: Repo Maintainers
Last verified: 2026-03-12

## When to use it
Use this skill when touching `fixtures/runtime/**`, `internal/runtimefixture/**`, the startup path, the health endpoint, or observability docs.

## Exact commands
- `deno task smoke`
- `deno task score --vector runtime-boot`
- `PORT=8010 deno task dev`

## Expected observations
- The smoke run writes `docs/generated/improvement/runtime-smoke.json`.
- `.tmp/runtime/<run-id>/server.log` contains structured JSON logs.
- `/healthz` returns `status: ok` and startup timing.

## Common failures
- Port already in use
- `curl` missing or unable to reach the local fixture
- `/healthz` or `/metrics` returning non-200 responses

## Recovery steps
- Re-run with a different `PORT`.
- Check `.tmp/runtime/<run-id>/server.log`.
- Re-run `deno task score --vector runtime-boot` after fixing the runtime or docs-hygiene issue.
