# Design docs index
Owner: Repo Maintainers
Last verified: 2026-03-16

Design docs capture decisions that should outlive a single PR.

## How to add a design doc
1. Copy the template from below.
2. Put it in `docs/design-docs/`.
3. Add it to this index.

## Status meanings
- Draft: exploring; not yet enforced
- Accepted: decision is active and should be followed
- Superseded: replaced by a newer doc (link it)
- Verified: recently checked against reality

## Catalog
- `core-beliefs.md` — Accepted, Verified (2026-02-12)
- `improvement-kernel-v1.md` — Superseded, Verified (2026-03-16)
- `optional-improvement-kernel.md` — Accepted, Verified (2026-03-16)

## Template
- Title
- Status
- Context
- Decision
- Alternatives considered
- Consequences / tradeoffs
- Enforcement plan (docs/tests/lints)
- Verification notes (how to check it stays true)
