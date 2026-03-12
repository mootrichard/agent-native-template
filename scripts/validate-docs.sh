#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_INDEX="$ROOT_DIR/docs/index.md"

failures=0

note() {
  printf '%s\n' "$1"
}

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  failures=$((failures + 1))
}

to_epoch() {
  local day="$1"
  if date -d "$day" +%s >/dev/null 2>&1; then
    date -d "$day" +%s
    return
  fi
  date -j -f "%Y-%m-%d" "$day" +%s
}

resolve_path() {
  local source_file="$1"
  local token="$2"
  local source_dir rel_dir rel_file

  source_dir="$(cd "$(dirname "$source_file")" && pwd)"

  case "$token" in
    http://*|https://*)
      return 1
      ;;
    docs/*|AGENTS.md|ARCHITECTURE.md|README.md|WORKFLOW.md)
      if [[ -e "$ROOT_DIR/$token" ]]; then
        printf '%s\n' "$ROOT_DIR/$token"
        return 0
      fi
      ;;
    /*)
      if [[ -e "$token" ]]; then
        printf '%s\n' "$token"
        return 0
      fi
      return 1
      ;;
  esac

  if [[ -d "$source_dir/$token" ]]; then
    (cd "$source_dir/$token" && pwd)
    return 0
  fi

  if [[ -f "$source_dir/$token" ]]; then
    rel_dir="$(dirname "$token")"
    rel_file="$(basename "$token")"
    printf '%s/%s\n' "$(cd "$source_dir/$rel_dir" && pwd)" "$rel_file"
    return 0
  fi

  return 1
}

extract_tokens() {
  local source_file="$1"

  grep -Eo '`[^`]+`' "$source_file" | sed -E 's/^`//; s/`$//' || true
  grep -Eo '\[[^]]+\]\([^)]+\)' "$source_file" | sed -E 's/.*\(([^)]+)\).*/\1/' || true
}

check_metadata() {
  local file="$1" verified_line verified_day file_epoch now_epoch age_days max_age_days

  if ! grep -Eiq '^Owner:[[:space:]]+.+' "$file"; then
    fail "$file is missing 'Owner:' metadata."
  fi

  verified_line="$(grep -Ei '^Last verified:[[:space:]]*[0-9]{4}-[0-9]{2}-[0-9]{2}$' "$file" | head -n 1 || true)"
  if [[ -z "$verified_line" ]]; then
    fail "$file is missing 'Last verified: YYYY-MM-DD' metadata."
    return
  fi

  verified_day="$(printf '%s\n' "$verified_line" | sed -E 's/^Last verified:[[:space:]]*//' | tr -d '[:space:]')"
  file_epoch="$(to_epoch "$verified_day" 2>/dev/null || true)"
  now_epoch="$(to_epoch "$(date +%Y-%m-%d)" 2>/dev/null || true)"

  if [[ -z "$file_epoch" || -z "$now_epoch" ]]; then
    fail "$file has an invalid Last verified date: $verified_day."
    return
  fi

  max_age_days="${DOC_MAX_AGE_DAYS:-180}"
  age_days="$(( (now_epoch - file_epoch) / 86400 ))"
  if (( age_days > max_age_days )); then
    fail "$file has stale metadata ($age_days days old; max $max_age_days)."
  fi
}

check_reachability() {
  local -a queue docs_files
  local current token resolved base
  local -A visited_indexes reachable_docs

  if [[ ! -f "$DOCS_INDEX" ]]; then
    fail "Missing docs index at $DOCS_INDEX."
    return
  fi

  queue=("$DOCS_INDEX")
  reachable_docs["$DOCS_INDEX"]=1

  while ((${#queue[@]} > 0)); do
    current="${queue[0]}"
    queue=("${queue[@]:1}")

    if [[ -n "${visited_indexes[$current]:-}" ]]; then
      continue
    fi
    visited_indexes["$current"]=1

    while IFS= read -r token; do
      [[ -z "$token" ]] && continue

      resolved="$(resolve_path "$current" "$token" || true)"
      [[ -z "$resolved" ]] && continue

      if [[ -d "$resolved" ]]; then
        while IFS= read -r dir_doc; do
          reachable_docs["$dir_doc"]=1
        done < <(find "$resolved" -maxdepth 1 -type f -name '*.md' | sort)

        if [[ -f "$resolved/index.md" ]]; then
          queue+=("$resolved/index.md")
        fi
        if [[ -f "$resolved/README.md" ]]; then
          queue+=("$resolved/README.md")
        fi
        continue
      fi

      if [[ -f "$resolved" && "$resolved" == *.md ]]; then
        reachable_docs["$resolved"]=1
        base="$(basename "$resolved")"
        if [[ "$base" == "index.md" || "$base" == "README.md" ]]; then
          queue+=("$resolved")
        fi
      fi
    done < <(extract_tokens "$current")
  done

  while IFS= read -r doc_file; do
    if [[ -z "${reachable_docs[$doc_file]:-}" ]]; then
      fail "${doc_file#$ROOT_DIR/} is not reachable from docs/index.md through index docs or indexed directories."
    fi
  done < <(find "$ROOT_DIR/docs" -type f -name '*.md' | sort)
}

check_design_doc_index() {
  local design_index="$ROOT_DIR/docs/design-docs/index.md"
  local design_doc basename

  if [[ ! -f "$design_index" ]]; then
    fail "Missing design doc index at docs/design-docs/index.md."
    return
  fi

  while IFS= read -r design_doc; do
    basename="$(basename "$design_doc")"

    if ! grep -Fq "$basename" "$design_index"; then
      fail "Design doc $basename is missing from docs/design-docs/index.md."
      continue
    fi

    if ! grep -Eq "$basename.*(Draft|Accepted|Superseded|Verified)" "$design_index"; then
      fail "Design doc $basename is listed without a status in docs/design-docs/index.md."
    fi
  done < <(find "$ROOT_DIR/docs/design-docs" -maxdepth 1 -type f -name '*.md' ! -name 'index.md' | sort)
}

check_exec_plan_placement() {
  local plan_doc rel
  while IFS= read -r plan_doc; do
    rel="${plan_doc#$ROOT_DIR/}"
    case "$rel" in
      docs/exec-plans/README.md|docs/exec-plans/tech-debt-tracker.md|docs/exec-plans/active/*.md|docs/exec-plans/completed/*.md)
        ;;
      *)
        fail "$rel must live in docs/exec-plans/active or docs/exec-plans/completed."
        ;;
    esac
  done < <(find "$ROOT_DIR/docs/exec-plans" -type f -name '*.md' | sort)
}

note "Running docs metadata checks..."
while IFS= read -r markdown_file; do
  check_metadata "$markdown_file"
done < <(
  {
    printf '%s\n' "$ROOT_DIR/AGENTS.md"
    printf '%s\n' "$ROOT_DIR/ARCHITECTURE.md"
    printf '%s\n' "$ROOT_DIR/README.md"
    printf '%s\n' "$ROOT_DIR/WORKFLOW.md"
    find "$ROOT_DIR/docs" -type f -name '*.md'
  } | sort -u
)

note "Running docs reachability checks..."
check_reachability

note "Running design-doc index checks..."
check_design_doc_index

note "Running ExecPlan placement checks..."
check_exec_plan_placement

if ((failures > 0)); then
  printf '\nDocs validation failed with %d error(s).\n' "$failures" >&2
  exit 1
fi

note "Docs validation passed."
