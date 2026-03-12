# Rename Runtime Fixture out of App
Owner: Repo Maintainers
Last verified: 2026-03-12

## Purpose / Big Picture
Move the bootable runtime fixture out of the repo-root `app/` directory so the template no longer implies that seeded projects should be implemented as Deno applications. The runtime fixture should remain bootable and scoreable, but it should read clearly as template tooling rather than product code.

## Progress
- [x] (2026-03-12 03:43Z) Audited live references to `app/` and confirmed the main contributor-facing confusion comes from the repo-root runtime entrypoint.
- [x] (2026-03-12 03:46Z) Moved the runtime entrypoint to `fixtures/runtime/main.ts`, updated the dev/smoke wrappers, and removed the empty `app/` directory.
- [x] (2026-03-12 03:47Z) Updated current-facing docs, policy, and scorecards to describe the runtime as disposable template infrastructure and to scope runtime work to both fixture bootstrap and shared runtime logic.
- [x] (2026-03-12 03:48Z) Re-ran docs validation, tests, smoke, and runtime scoring against the new fixture path and prepared this plan for archival.

## Surprises & Discoveries
- Observation: The actual HTTP behavior already lives outside `app/`; `app/main.ts` is only a thin bootstrap over `internal/runtimefixture/runtime.ts`.
  Evidence: `app/main.ts` only reads `PORT`, installs signal handlers, and calls `createRuntimeApp()` from `internal/runtimefixture/runtime.ts`.
- Observation: The runtime scorecard and workflow scope previously covered only the bootstrap path, not the shared runtime implementation that actually serves requests.
  Evidence: Before this rename, `scorecards/runtime-boot.json` and `WORKFLOW.md` scoped `runtime-boot` to `app/**` but omitted `internal/runtimefixture/**`.

## Decision Log
- Decision: Move the entrypoint to `fixtures/runtime/main.ts`.
  Rationale: `fixtures/` communicates that the HTTP service is a replaceable scaffold, not the product architecture for seeded repos.
  Date/Author: 2026-03-12 / Codex

## Outcomes & Retrospective
Shipped:
- runtime bootstrap moved from `app/main.ts` to `fixtures/runtime/main.ts`
- `scripts/dev.sh` and `scripts/smoke.sh` now boot the fixture from `fixtures/runtime/`
- current-facing docs now describe the HTTP service as a disposable runtime fixture rather than a product app

Clarified scope:
- `WORKFLOW.md` and `scorecards/runtime-boot.json` now include both `fixtures/runtime/**` and `internal/runtimefixture/**` in runtime-fixture scope

Behavior preserved:
- smoke artifacts, runtime score artifacts, logs, metrics, and endpoints remained unchanged

## Context and Orientation
- Current runtime entrypoint: `fixtures/runtime/main.ts`
- Shared runtime behavior: `internal/runtimefixture/runtime.ts`
- Wrappers to update: `scripts/dev.sh`, `scripts/smoke.sh`
- Current-facing docs/policy to update: `README.md`, `ARCHITECTURE.md`, `WORKFLOW.md`, `docs/OBSERVABILITY.md`, `docs/FRONTEND.md`, `docs/scorecards/runtime-boot.md`, `scorecards/runtime-boot.json`

## Plan of Work
Move the thin HTTP bootstrap from `app/` into `fixtures/runtime/`, keep the implementation and artifacts stable, and then rewrite the user-facing language to describe the runtime as a disposable fixture. Historical plans can remain historical unless they need a clarification note.

## Concrete Steps
1. Add `fixtures/runtime/main.ts` with the current bootstrap logic and remove `app/main.ts`.
2. Update shell scripts and any runtime-scoring references to the new path.
3. Rewrite current-facing docs and policy to point at `fixtures/runtime/` and explain why it exists.
4. Run docs validation, test, smoke, and runtime score commands.
5. Move this plan to `docs/exec-plans/completed/`.

## Validation and Acceptance
- `./scripts/validate-docs.sh`
- `deno task test`
- `deno task smoke`
- `deno task score --vector runtime-boot`

Observed validation:
- `./scripts/validate-docs.sh`
- `deno task test`
- `deno task smoke`
- `deno task score --vector runtime-boot`

## Idempotence and Recovery
- Keep runtime behavior unchanged while renaming the entrypoint.
- Leave historical records alone unless a path reference needs explicit clarification.
- If the new location causes drift in scripts or scorecards, fix the references rather than reintroducing `app/`.

## Interfaces and Dependencies
- Entry point after rename: `fixtures/runtime/main.ts`
- Shared runtime logic remains in `internal/runtimefixture/runtime.ts`
- Required binaries remain `bash`, `git`, `deno`, `curl`

## Artifacts and Notes
- The goal is naming clarity, not runtime behavior change.
