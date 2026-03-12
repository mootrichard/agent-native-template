# Runtime Boot Scorecard
Owner: Repo Maintainers
Last verified: 2026-03-12

## What this vector measures
`runtime-boot` verifies that the template can boot a real local service and expose usable runtime signals.
It measures `startup_ms` with direction `min`.

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
- `docs/generated/improvement/runtime-smoke.json`
- `docs/generated/improvement/runtime-boot-score.json`

## Operating notes
- Run `deno task smoke` for a fast runtime probe.
- Run `deno task score --vector runtime-boot` for the score artifact used by the improvement kernel.
- Runtime scoring keeps structured logs, endpoint responses, and the final score artifact as evidence.
