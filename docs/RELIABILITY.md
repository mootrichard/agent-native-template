# Reliability
Owner: Repo Maintainers
Last verified: 2026-03-12

## Reliability posture
- Prefer designs that fail safely and visibly.
- Make failure modes testable and observable.

## Baseline fixture budgets
- Startup: local fixture should reach `/healthz` in under 5 seconds; `startup_ms` is the scored metric.
- Smoke pass rate: 100% in local and CI runs.
- Docs hygiene dependency: runtime score is invalid when docs validation fails.
- Recovery: the fixture should shut down cleanly at process exit without leaving required background services behind.

## Requirements
- Startup health checks
- Timeouts with sane defaults in smoke/score scripts
- Visible request ids and structured logs for debugging
- Conservative failure handling for promotion decisions

## Agent workflows
- Reliability changes must include:
  - a measurable target,
  - evidence (logs/metrics/artifacts) that target is met,
  - an explanation of whether the change belongs in the default fast loop or a separate scorecard.
