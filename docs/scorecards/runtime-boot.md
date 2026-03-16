# Runtime Boot Scorecard

Owner: Repo Maintainers
Last verified: 2026-03-16

## What this vector measures

`runtime-boot` verifies that the template can boot a real local service and expose usable runtime
signals. It measures `startup_ms` with direction `min`.

## Guardrails

- `health_status == 200`
- `smoke_pass == true`
- `docs_hygiene_exit_code == 0`

## Files in scope

- `fixtures/runtime/**`
- `internal/runtimefixture/**`
- `scripts/dev.sh`
- `scripts/smoke.sh`
- `scripts/install-deps.sh`
- `docs/OBSERVABILITY.md`
- `docs/RELIABILITY.md`
- `docs/scorecards/runtime-boot.md`
- `scorecards/runtime-boot.json`

## Artifacts

- `.tmp/improvement/runtime-smoke.json`
- `.tmp/improvement/runtime-boot-score.json`

## Operating notes

- Run `deno task smoke` for a fast runtime probe.
- Run `deno task score --vector runtime-boot` for a transient runtime score artifact.
- Publish a copy explicitly only when the latest runtime evidence should be versioned.
- Runtime scoring keeps structured logs, endpoint responses, and the final score artifact as local
  evidence under `.tmp/`.
