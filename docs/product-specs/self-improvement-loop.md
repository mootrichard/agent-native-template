# Self-Improvement Loop

Owner: Repo Maintainers
Last verified: 2026-03-13

## Goal

A future agent should be able to improve the template using repo-local scorecards, proposal
artifacts, change packages, and ledger evidence without external instructions.

## Operating model

The intended loop is:

1. Signals are observed from scorecards, smoke artifacts, incidents, or operator notes.
2. The kernel scores the relevant vector and captures or refreshes a baseline when needed.
3. `deno task propose --vector <vector>` turns those signals into a structured proposal artifact.
4. When the signals justify action, proposal generation scaffolds a deterministic change package
   under `changes/`.
5. A human or downstream execution system implements the bounded change.
6. The repo runs validation, scoring, and experiments against the candidate branch.
7. Humans review and merge according to project policy.
8. Post-merge signals feed the next loop.

## Boundary

- The kernel proposes.
- Executors implement.
- Humans govern.

The template intentionally stops at the proposal and change-package boundary. External tracker
publication or unattended execution can be layered on later by systems like Symphony.

## Expected agent journey

1. Create or refresh an ExecPlan.
2. Create a branch for the candidate change.
3. Run `deno task baseline --vector <vector>`.
4. Make the scoped change.
5. Run `deno task score --vector <vector>`.
6. Run `deno task propose --vector <vector>` when the score should become an auditable handoff.
7. Run `deno task experiment --vector <vector> --candidate-ref <ref>`.
8. Inspect `improvement/ledger/experiments/*.json`.
9. Run `deno task promote` for promotable candidates or `deno task revert` for rejected ones.

## Acceptance

- Comparison uses baseline vs candidate Git refs.
- Ledger entries are append-only JSON.
- Proposal artifacts are machine-readable and live under `docs/generated/improvement/`.
- Change packages are deterministic and live under `changes/`.
- Promotion is conservative and fast-forward only.
- Revert is safe by default and records an artifact instead of deleting data.
