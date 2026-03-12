# docs/ — repository knowledge base (system of record)
Owner: Repo Maintainers
Last verified: 2026-03-12

If it isn’t in this directory (or enforced in code/tests), it might as well not exist.

## Start here (agents)
1. `../WORKFLOW.md` — constitutional policy and protected-path rules
2. `docs/DESIGN.md` — design principles and “taste invariants”
3. `docs/QUALITY_SCORE.md` — what “good” means here (guardrails)
4. `docs/PLANS.md` — how to write and execute plans for multi-hour tasks
5. `docs/LINTS.md` — what is enforced mechanically
6. `docs/GC.md` — recurring cleanup / drift control

## Product, architecture, and operations
- `../ARCHITECTURE.md` — short codemap + invariants
- `docs/PRODUCT_SENSE.md` — product principles & acceptance language
- `docs/RELIABILITY.md` — SLOs, perf budgets, resilience requirements
- `docs/OBSERVABILITY.md` — how to query signals and validate behavior
- `docs/SECURITY.md` — threat model, boundary parsing, secure defaults
- `docs/FRONTEND.md` — UI legibility and deterministic validation guidance
- `docs/product-specs/index.md` — expected user and agent journeys
- `docs/skills/index.md` — repo-local procedures for common tasks
- `docs/scorecards/index.md` — executable vectors and artifact meanings

## Design history
- `docs/design-docs/index.md` — catalog and verification status
- `docs/design-docs/core-beliefs.md` — agent-first operating principles
- `docs/design-docs/improvement-kernel-v1.md` — accepted kernel design for scorecards + ledger + runtime

## Plans and evidence
- `docs/exec-plans/README.md`
- `docs/exec-plans/active/`
- `docs/exec-plans/completed/`
- `docs/exec-plans/tech-debt-tracker.md`
- `../improvement/README.md` — append-only experiment history
- `docs/generated/improvement/README.md` — generated score/smoke evidence

## Generated + references
- `docs/generated/README.md`
- `docs/references/index.md`
- `docs/references/sources.md`
