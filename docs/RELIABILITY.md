# Reliability
Owner: Repo Maintainers
Last verified: 2026-02-12

## Reliability posture
- Prefer designs that fail safely and visibly.
- Make failure modes testable and observable.

## Define SLOs (set when first service exists)
- Availability:
- Latency:
- Error budget:
- Recovery time:

## Requirements
- Startup health checks
- Timeouts and retries with sane defaults
- Backpressure and bounded concurrency
- Load/soak test strategy for critical paths

## Agent workflows
- Reliability changes must include:
  - a reproduction or benchmark,
  - a measurable target,
  - evidence (logs/metrics/traces) that target is met.
