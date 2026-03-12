# Quality score (what “good” means here)
Owner: Repo Maintainers
Last verified: 2026-03-12

This repo optimizes for agent throughput without decay.

## The “quality equation”
Quality = executable scorecards + legible boundaries + safe defaults + durable evidence

## Guardrails we aim to encode
1. **High test coverage of changed behavior**
   - Kernel logic, runtime smoke behavior, and ledger summaries have direct tests.
2. **Small, well-namespaced files**
   - Directory structure is a navigation interface for agents.
3. **Fast checks**
   - `deno task test` and `deno task validate` stay cheap enough for repeated local use.
4. **Determinism**
   - Artifacts use UTC timestamps, stable JSON keys, and explicit paths.
5. **Evidence-based PRs**
   - Scorecards, smoke artifacts, and ledger entries make validation inspectable.
6. **Conservative promotion**
   - `non_regressing` is the default rule until a stronger case exists.

## What to do when quality is missing
Don’t “try harder”.
Add a missing capability: a test, a lint, a script, a doc, or an invariant.
