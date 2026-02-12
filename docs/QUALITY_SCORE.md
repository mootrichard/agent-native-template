# Quality score (what “good” means here)
Owner: Repo Maintainers
Last verified: 2026-02-12

This repo optimizes for agent throughput without decay.

## The “quality equation”
Quality = (mechanical verifiability) + (legibility) + (safe defaults)

## Guardrails we aim to encode
1. **High test coverage of changed behavior**
   - Coverage reports should be actionable: uncovered lines are a to-do list.
2. **Small, well-namespaced files**
   - Directory structure is a navigation interface for agents.
3. **Fast checks**
   - Tests and lints must be cheap enough to run repeatedly in the loop.
4. **Determinism**
   - Reduce flakiness; when flakes exist, track and fix them quickly.
5. **Evidence-based PRs**
   - Every PR includes how it was validated and what the expected outcomes are.

## What to do when quality is missing
Don’t “try harder”.
Add a missing capability: a test, a lint, a script, a doc, or an invariant.
