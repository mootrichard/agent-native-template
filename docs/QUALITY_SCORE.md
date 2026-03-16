# Quality score (what “good” means here)

Owner: Repo Maintainers
Last verified: 2026-03-16

This repo optimizes for agent throughput without decay.

## The “quality equation”

Quality = fast validation + legible boundaries + safe defaults + explicit evidence publishing

## Guardrails we aim to encode

1. **High test coverage of changed behavior**
   - Kernel logic, runtime smoke behavior, and runtime responses have direct tests.
2. **Small, well-namespaced files**
   - Directory structure is a navigation interface for agents.
3. **Fast checks**
   - `deno task validate` stays cheap enough for repeated local use.
4. **Determinism**
   - Artifacts use UTC timestamps, stable JSON keys, and explicit paths.
5. **Transient-by-default evidence**
   - Routine checks write under `.tmp/` and keep the worktree clean.
6. **Explicit publication**
   - Versioned generated artifacts exist only when someone intentionally publishes them.

## What to do when quality is missing

Don’t “try harder”. Add a missing capability: a test, a lint, a script, a doc, or an invariant.
