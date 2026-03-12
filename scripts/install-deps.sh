#!/usr/bin/env bash
set -euo pipefail

required_bins=(deno git curl)
missing=()

for bin in "${required_bins[@]}"; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    missing+=("$bin")
  fi
done

if ((${#missing[@]} > 0)); then
  printf 'Missing required binaries: %s\n' "${missing[*]}" >&2
  exit 1
fi

printf 'Verified prerequisites:\n'
printf -- '- deno: %s\n' "$(deno --version | head -n 1)"
printf -- '- git: %s\n' "$(git --version 2>&1)"
printf -- '- curl: %s\n' "$(curl --version | head -n 1)"
echo "No package-manager dependencies are installed by the template baseline."
