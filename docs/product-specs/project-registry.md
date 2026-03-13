# Project Registry

Owner: Repo Maintainers
Last verified: 2026-03-13

## Goal

Seeded repos should carry an explicit local project registry so future execution systems can resolve
workflow, validation, scorecards, and governance from config instead of prompt folklore.

## Current state

- This template ships `projects/registry.json` as the default routing contract for the seeded repo
  itself.
- The default entry is intentionally small: workflow path, validation commands, scorecards, and
  merge-policy defaults.
- Tracker or backlog integration remains optional extension work for systems layered on top of the
  template.

## Target model

A project entry should be able to answer:

- which workflow contract an executor should load
- which validation commands and scorecards are required
- which source path is authoritative
- which risk tier and merge policy defaults apply

Example shape:

```json
{
  "default_project": "template",
  "projects": {
    "template": {
      "workflow": {
        "path": "AGENTS.md"
      },
      "validation": [
        "deno task validate",
        "deno task score --vector docs-hygiene"
      ],
      "scorecards": [
        "docs-hygiene",
        "runtime-boot",
        "automation-harness-health"
      ],
      "risk_tier": "moderate",
      "merge_policy": {
        "safe": "auto_if_green",
        "moderate": "one_human",
        "risky": "two_humans",
        "critical": "manual_only"
      }
    }
  }
}
```

## Selection rules

At dispatch time, a future execution system should be able to resolve the project entry and then use
it to choose:

- which workflow contract to load
- which scorecards or validation commands to run
- which risk tier and merge policy to apply

## Design constraint

Routing belongs in structured config. It should not depend on hidden conventions in prompts, issue
titles, or shell wrappers.
