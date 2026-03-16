# Observability (logs, metrics, traces) for agent validation
Owner: Repo Maintainers
Last verified: 2026-03-16

## Why
Agents need direct access to runtime signals to:
- reproduce bugs,
- validate fixes,
- reason about performance budgets.

## What the template provides today
- Logs: structured JSON logs written by the runtime fixture
- Metrics: simple machine-readable JSON at `/metrics`
- Correlation ids: request ids returned in response headers and logs
- Traces: not included in the template baseline yet

## Local dev principle
Dev environments should be:
- **ephemeral** (tear down cleanly),
- **isolated** per worktree,
- **fast to boot**.

## Runtime fixture commands
- Start it: `deno task dev`
- Smoke it: `deno task smoke`
- Score it: `deno task score --vector runtime-boot`
- Publish evidence explicitly: `deno task publish-artifact --from <path> --to <path>`

The fixture is template infrastructure, not a prescribed application stack. Seeded projects can replace or delete it once they have a real runtime.

## Runtime fixture signals
- Logs live under `.tmp/runtime/<run-id>/server.log`
- Health lives at `/healthz`
- Metrics live at `/metrics`
- Smoke artifacts live under `.tmp/improvement/runtime-smoke.json` by default
- Startup timing and request counters are included in health/metrics payloads
- Each request gets an `X-Request-Id`

## What seeded projects should extend later
- richer service-level metrics
- real traces for critical flows
- domain-specific latency/error dashboards

The template baseline is intentionally honest: structured logs, simple metrics, and correlation ids
are present; a full tracing stack is not.
