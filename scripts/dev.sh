#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_ID="${RUN_ID:-dev-$(date -u +%Y%m%dT%H%M%SZ)}"
PORT="${PORT:-8000}"
RUN_DIR="$ROOT_DIR/.tmp/runtime/$RUN_ID"
LOG_PATH="$RUN_DIR/server.log"

mkdir -p "$RUN_DIR"

echo "Starting runtime fixture on http://127.0.0.1:$PORT"
echo "Logs will be written to $LOG_PATH"
echo "Press Ctrl-C to stop."

PORT="$PORT" deno run -A ./fixtures/runtime/main.ts 2>&1 | tee "$LOG_PATH"
