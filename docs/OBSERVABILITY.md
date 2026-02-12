# Observability (logs, metrics, traces) for agent validation
Owner: Repo Maintainers
Last verified: 2026-02-12

## Why
Agents need direct access to runtime signals to:
- reproduce bugs,
- validate fixes,
- reason about performance budgets.

## Required signals
- Logs: structured, queryable
- Metrics: key service-level counters/histograms
- Traces: spans for critical journeys

## Local dev principle
Dev environments should be:
- **ephemeral** (tear down cleanly),
- **isolated** per worktree,
- **fast to boot**.

## What to document for each service
- how to start it,
- where logs/metrics/traces are exposed,
- example queries to confirm health and performance.

## Performance budgets (examples; tailor to your product)
- startup under X ms
- critical journey spans under Y seconds
- error rate below Z
