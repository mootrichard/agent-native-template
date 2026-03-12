#!/usr/bin/env bash
set -euo pipefail

./scripts/validate-docs.sh
deno test -A tests
