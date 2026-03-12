# Self-Improvement Loop
Owner: Repo Maintainers
Last verified: 2026-03-12

## Goal
A future agent should be able to improve the template using repo-local scorecards, experiments, and ledger evidence without external instructions.

## Expected agent journey
1. Create or refresh an ExecPlan.
2. Create a branch for the candidate change.
3. Run `deno task baseline --vector <vector>`.
4. Make the scoped change.
5. Run `deno task score --vector <vector>`.
6. Run `deno task experiment --vector <vector> --candidate-ref <ref>`.
7. Inspect `improvement/ledger/experiments/*.json`.
8. Run `deno task promote` for promotable candidates or `deno task revert` for rejected ones.

## Acceptance
- Comparison uses baseline vs candidate Git refs.
- Ledger entries are append-only JSON.
- Promotion is conservative and fast-forward only.
- Revert is safe by default and records an artifact instead of deleting data.
