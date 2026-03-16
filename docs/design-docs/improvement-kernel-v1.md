# Improvement kernel v1
Owner: Repo Maintainers
Last verified: 2026-03-16

## Status
Superseded

## Context
This design introduced a harness-first improvement kernel into the baseline starter. It proved that
repo-local scorecards, ledger entries, and proposal artifacts could be made mechanically checkable,
but it also increased the default surface area and caused routine validation to touch tracked
evidence paths.

## Decision
Move the improvement-kernel idea out of the default starter contract.
Keep only the baseline scorecards and runtime fixture in the template, and preserve the heavier
governance ideas as an optional extension.

## Alternatives Considered
- Keep the harness-first kernel in the baseline starter.
  Rejected because the default repo should optimize for elegant simplicity and clean routine loops.

## Consequences / Tradeoffs
- The advanced kernel remains available as a design pattern, but not as baseline code.
- Routine validation becomes cleaner because transient evidence stays under `.tmp/`.
- Seeded projects must add heavier governance only when they actually need it.

## Enforcement Plan
- Protect policy and kernel files in `WORKFLOW.md`.
- Validate docs structure with `scripts/validate-docs.sh`.
- Keep executable starter vectors in `scorecards/*.json`.
- Preserve the optional extension in design docs rather than baseline tasks.

## Verification Notes
- `deno task score --vector docs-hygiene`
- `deno task smoke`
- `deno task score --vector runtime-boot`
