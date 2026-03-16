#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_ID="${RUN_ID:-smoke-$(date -u +%Y%m%dT%H%M%SZ)}"
ARTIFACT_PATH="${ARTIFACT_PATH:-$ROOT_DIR/.tmp/improvement/runtime-smoke.json}"
RUN_DIR="$ROOT_DIR/.tmp/runtime/$RUN_ID"
LOG_PATH="$RUN_DIR/server.log"
HEALTH_PATH="$RUN_DIR/healthz.json"
ROOT_RESPONSE_PATH="$RUN_DIR/root.json"
METRICS_PATH="$RUN_DIR/metrics.json"
mkdir -p "$RUN_DIR" "$(dirname "$ARTIFACT_PATH")"

if [[ -z "${PORT:-}" ]]; then
  PORT="$(deno run -A ./cmd/kernel.ts free-port)"
fi

BASE_URL="http://127.0.0.1:$PORT"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

(
  cd "$ROOT_DIR"
  PORT="$PORT" deno run -A ./fixtures/runtime/main.ts >"$LOG_PATH" 2>&1
) &
SERVER_PID="$!"

health_status="000"
for _ in $(seq 1 50); do
  health_status="$(curl -sS -o "$HEALTH_PATH" -w '%{http_code}' "$BASE_URL/healthz" 2>/dev/null || true)"
  if [[ "$health_status" == "200" ]]; then
    break
  fi
  sleep 0.1
done

root_status="000"
metrics_status="000"
if [[ "$health_status" == "200" ]]; then
  root_status="$(curl -sS -o "$ROOT_RESPONSE_PATH" -w '%{http_code}' "$BASE_URL/" 2>/dev/null || true)"
  metrics_status="$(curl -sS -o "$METRICS_PATH" -w '%{http_code}' "$BASE_URL/metrics" 2>/dev/null || true)"
fi

(
  cd "$ROOT_DIR"
  deno run -A ./cmd/kernel.ts write-smoke-artifact \
    --artifact-path "$ARTIFACT_PATH" \
    --base-url "$BASE_URL" \
    --run-id "$RUN_ID" \
    --run-dir "$RUN_DIR" \
    --log-path "$LOG_PATH" \
    --health-path "$HEALTH_PATH" \
    --root-path "$ROOT_RESPONSE_PATH" \
    --metrics-path "$METRICS_PATH" \
    --port "$PORT" \
    --health-status "$health_status" \
    --root-status "$root_status" \
    --metrics-status "$metrics_status"
)
