# PLANS.md — ExecPlans for multi-hour work
Owner: Repo Maintainers
Last verified: 2026-02-12

An ExecPlan is a living design+execution document that lets a stateless agent (or a new human)
deliver a feature end-to-end with no external context.

## When to use an ExecPlan
Use an ExecPlan for:
- new features that touch multiple modules,
- significant refactors,
- any task expected to take > ~30 minutes of research+implementation.

## Non-negotiables
- Self-contained: all required context is in the plan or referenced in-repo.
- Outcome-focused: describe what someone can *do* after the change and how to verify it.
- Living: update it as you learn; record surprises and decisions.
- Verifiable: every milestone has commands and expected observations.

## Required sections (must stay current)
- Purpose / Big Picture
- Progress (checkbox list with timestamps)
- Surprises & Discoveries (include evidence snippets)
- Decision Log (decision, rationale, date/author)
- Outcomes & Retrospective (what shipped, what didn’t, lessons)
- Context and Orientation (paths, modules, definitions)
- Plan of Work (narrative)
- Concrete Steps (exact commands + working dirs)
- Validation and Acceptance (behavior-based)
- Idempotence and Recovery (retry/rollback guidance)
- Interfaces and Dependencies (explicit names and signatures)

## Style rules
- Plain prose first; don’t drown the reader in checklists (except Progress).
- Name repo-relative paths precisely.
- Avoid external links as dependencies; embed necessary knowledge in your own words.
- Prefer additive changes with tests staying green throughout.

## ExecPlan skeleton (copy into new files in docs/exec-plans/active/)
---
# <Short, action-oriented title>

## Purpose / Big Picture

## Progress
- [ ] (YYYY-MM-DD HH:MMZ) …

## Surprises & Discoveries
- Observation:
  Evidence:

## Decision Log
- Decision:
  Rationale:
  Date/Author:

## Outcomes & Retrospective

## Context and Orientation

## Plan of Work

## Concrete Steps

## Validation and Acceptance

## Idempotence and Recovery

## Interfaces and Dependencies

## Artifacts and Notes
---
