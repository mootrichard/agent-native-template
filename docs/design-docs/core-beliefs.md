# Core beliefs for an agent-first repo
Status: Accepted
Last verified: 2026-02-12
Owner: Repo Maintainers

## Belief 1: Humans steer; agents execute
Humans provide intent, constraints, and acceptance criteria.
Agents implement, validate, document, and iterate.

## Belief 2: What isn’t in the repo doesn’t exist
Important knowledge must be encoded into:
- docs,
- tests,
- executable plans,
- schemas,
- tooling/lints.

## Belief 3: Legibility beats cleverness
Agents thrive on predictable structure, small files, and explicit boundaries.

## Belief 4: Constraints are multipliers
Encode invariants mechanically so they apply everywhere, all the time.

## Belief 5: Continuous cleanup prevents slop
Drift is normal. We prevent compounding debt via recurring GC loops and refactors.
