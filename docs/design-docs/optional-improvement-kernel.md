# Optional improvement kernel
Owner: Repo Maintainers
Last verified: 2026-03-16

## Status
Accepted

## Context
Some seeded projects will eventually want stronger governance than the baseline starter provides:
proposal artifacts, project routing, structured PR evidence, or append-only experiment history.
Those capabilities are valuable only after the project proves they reduce risk more than they add
maintenance cost.

## Decision
Keep the baseline template simple:
- one canonical validation loop,
- baseline scorecards for docs and runtime,
- a disposable runtime fixture,
- transient-by-default evidence.

Treat heavier governance as an optional extension that a seeded project may add later when there is
clear operational pressure for it.

## Alternatives considered
- Keep proposal, registry, and ledger machinery in the default starter.
  Rejected because the default repo should not make every project pay that complexity tax.
- Remove the ideas entirely.
  Rejected because some projects will need them; the pattern is still useful.

## Consequences / tradeoffs
- Baseline adoption is cheaper and more legible.
- Advanced governance features require deliberate project-local adoption work.
- The repository preserves the design pattern without making it part of every iteration cycle.

## Enforcement plan
- Keep the advanced kernel out of the baseline command surface, CI, and scorecards.
- Document the extension here instead of maintaining partially active starter code.
- Require an ExecPlan and protected-path rationale before reintroducing heavier governance to the
  baseline.

## Verification notes
- `deno task validate`
- `deno task smoke`
- `deno task score --vector docs-hygiene`
- `deno task score --vector runtime-boot`
