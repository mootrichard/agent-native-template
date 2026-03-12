# Improvement Ledger
Owner: Repo Maintainers
Last verified: 2026-03-12

The ledger is the append-only history of scored experiments.

## Format
- One JSON document per experiment under `improvement/ledger/experiments/`
- Each entry records refs, metric comparison, guardrails, verdict, and evidence artifact paths

## Operating rule
- New outcomes append new files.
- Rejections add artifacts; they do not delete prior ledger entries.
