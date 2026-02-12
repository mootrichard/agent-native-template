# Frontend & UI legibility
Owner: Repo Maintainers
Last verified: 2026-02-12

Agents can validate UI behavior if we make it observable and automatable.

## Expectations
- UI flows should be reproducible locally.
- UI state must be inspectable via DOM snapshots/screenshots.
- Critical user journeys have explicit, automated checks.

## Agent-driven UI validation (concept)
- For meaningful UI changes, record:
  - how to reproduce the bug,
  - what changed,
  - evidence of the fix (screenshots/video if your tooling supports it),
  - the exact commands used.

## Guardrails
- Keep UI modules small and namespaced by domain.
- Prefer deterministic selectors and stable component boundaries.
- Accessibility and semantics help automation and reduce flakiness.
