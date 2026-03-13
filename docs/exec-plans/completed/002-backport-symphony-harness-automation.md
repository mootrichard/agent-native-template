# Backport Symphony Harness Automation Layer

Owner: Repo Maintainers
Last verified: 2026-03-13

## Purpose / Big Picture

Adapt the reusable repo-level automation layer from `/Users/richardmoot/Projects/symphony` into this
template so freshly bootstrapped projects start with the base harness engineering needed for systems
like Symphony to succeed. The template should gain explicit proposal artifacts, deterministic
change-package scaffolding, and a local project registry contract without pulling in
Symphony-specific runtime or Linear coupling.

## Progress

- [x] (2026-03-13 04:43Z) Read the template entrypoint docs (`docs/index.md`, `WORKFLOW.md`,
      `docs/PLANS.md`) and confirmed this task changes protected docs plus kernel files.
- [x] (2026-03-13 04:43Z) Compared the template kernel/docs against
      `/Users/richardmoot/Projects/symphony` and isolated the reusable subset: proposal generation,
      change packages, project registry resolution, and harness-oriented product specs.
- [x] (2026-03-13 04:55Z) Implemented proposal generation, change-package scaffolding, project
      registry resolution, and the `deno task propose` surface.
- [x] (2026-03-13 04:55Z) Updated scorecards, docs, README, workflow policy, and generated-artifact
      guidance to describe the new automation layer.
- [x] (2026-03-13 04:55Z) Added contract-score and proposal tests, then ran validation, score, and
      proposal commands to produce fresh evidence.

## Surprises & Discoveries

- Observation: The template already has the baseline experiment and ledger loop, so the missing
  layer is planning/publication metadata rather than scoring or promotion semantics. Evidence:
  `cmd/kernel.ts` currently exposes `baseline`, `score`, `experiment`, `promote`, `revert`, and GC
  commands, but no proposal or change-package flow.
- Observation: Symphony’s most reusable additions are repo-local and deterministic; the Linear
  publishing path is useful context but should stay out of the template baseline. Evidence:
  `internal/kernel/proposal.ts`, `internal/kernel/change_package.ts`, and `projects/registry.json`
  are generic; `internal/kernel/backlog.ts` is the external-service-specific part.
- Observation: The template docs currently model only bootstrap and self-improvement, so agents have
  no in-repo contract for project registry binding, harness modes, or review/merge legality
  compilation. Evidence: `docs/product-specs/index.md` lists only `template-bootstrap.md` and
  `self-improvement-loop.md`.
- Observation: `deno fmt` on Markdown collapses adjacent metadata lines into one paragraph, which
  breaks the docs validator unless the headers are repaired afterward. Evidence: the first
  validation pass failed on every reformatted doc until `Owner:` and `Last verified:` were split
  back into separate lines.

## Decision Log

- Decision: Backport proposal artifacts, change packages, and a local project registry, but not
  Linear story publication. Rationale: These pieces provide the base harness engineering Symphony
  depends on while keeping the template free of external backlog-service coupling. Date/Author:
  2026-03-13 / Codex
- Decision: Introduce one new scorecard focused on the automation contract instead of porting
  Symphony’s full scorecard set. Rationale: The template should verify the base harness layer is
  present and coherent, not pretend to ship project-specific workflow, tracker, or self-hosting
  logic. Date/Author: 2026-03-13 / Codex

## Outcomes & Retrospective

Shipped:
- `deno task propose` plus new kernel modules for proposal artifacts, project registry resolution,
  and deterministic change-package scaffolding
- `projects/registry.json`, `changes/README.md`, and `.github/pull_request_template.md` as seeded
  harness contracts
- a new `automation-harness-health` scorecard backed by `scripts/score-contracts.ts`
- product specs for project registry, per-project harnesses, review governance, and PR legality
- generated baseline, score, and proposal artifacts for `automation-harness-health`

Validation outcome:
- `./scripts/validate.sh`
- `deno task score --vector docs-hygiene`
- `deno task score --vector runtime-boot`
- `deno task score --vector automation-harness-health`
- `deno task baseline --vector automation-harness-health`
- `deno task propose --vector automation-harness-health`

What stayed out of scope:
- external backlog publication and tracker adapters
- project-specific workflow or self-hosting scorecards from Symphony

## Context and Orientation

- Template kernel entrypoints: `cmd/kernel.ts`, `internal/kernel/`, `deno.json`
- Current template product/docs surface: `README.md`, `ARCHITECTURE.md`, `WORKFLOW.md`,
  `docs/index.md`, `docs/product-specs/`, `docs/scorecards/`
- Current validation surface: `scripts/test.sh`, `scripts/validate.sh`, `tests/`
- Symphony reference inputs: `/Users/richardmoot/Projects/symphony/internal/kernel/proposal.ts`,
  `/Users/richardmoot/Projects/symphony/internal/kernel/change_package.ts`,
  `/Users/richardmoot/Projects/symphony/internal/kernel/project.ts`,
  `/Users/richardmoot/Projects/symphony/docs/product-specs/`

## Plan of Work

First add the minimal reusable kernel contracts: scorecards gain proposal metadata, the kernel
resolves an optional project registry, proposal artifacts are generated deterministically, and
change packages are scaffolded in a stable directory layout. Then update the template’s docs to
explain why these pieces exist, how they relate to harness engineering, and what remains
intentionally out of scope for a seeded repo. Finish by adding a narrow contract scorecard plus
tests that prove the new kernel surface and generated artifacts are stable.

## Concrete Steps

1. Extend the kernel types and CLI to support `deno task propose`.
2. Add project-registry and change-package helpers, plus proposal artifact generation under
   `docs/generated/improvement/`.
3. Add a template-local `projects/registry.json` and `changes/README.md`.
4. Add a contract scorecard and tests that verify the automation-layer files and commands are
   present.
5. Update product specs, architecture/README text, and scorecard docs to explain the backported
   harness layer.
6. Run `deno test -A tests`, `./scripts/validate-docs.sh`, and the relevant
   `deno task score/propose` commands.

## Validation and Acceptance

- `deno task propose --vector docs-hygiene` writes a structured proposal artifact under
  `docs/generated/improvement/`.
- Proposal generation scaffolds a deterministic change package under `changes/<change-id>/`.
- The repo carries a local project registry contract and product specs explaining how future systems
  like Symphony bind to it.
- The new automation-layer scorecard passes and remains machine-readable.
- Existing validation (`docs-hygiene`, `runtime-boot`, tests) continues to pass.

## Idempotence and Recovery

- Proposal generation should be rerunnable; repeated runs refresh artifacts rather than inventing
  incompatible layouts.
- Change-package materialization should preserve published metadata if the package already exists.
- The project registry remains optional for kernel execution; missing registry data should degrade
  to conservative defaults instead of breaking the existing vectors.

## Interfaces and Dependencies

- New CLI surface: `deno task propose --vector <scorecard> [--project <key>]`
- New repo contracts: `projects/registry.json`, `changes/<change-id>/change.json`,
  `changes/<change-id>/{proposal,design,tasks}.md`
- Updated scorecard schema: optional `proposal` metadata
- No new external services or runtime dependencies

## Artifacts and Notes

- Expected proposal artifact pattern: `docs/generated/improvement/<vector>-proposal.json`
- Expected change-package root: `changes/`
- Keep backlog publication and external tracker integration out of scope for this template pass.
- Generated artifacts from this pass:
  - `docs/generated/improvement/automation-harness-health-score.json`
  - `docs/generated/improvement/automation-harness-health-baseline.json`
  - `docs/generated/improvement/automation-harness-health-proposal.json`
