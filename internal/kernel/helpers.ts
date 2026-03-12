import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";

import type { CommandResult, Guardrail, LedgerEntry, PromotionResult, Scorecard } from "./types.ts";

export async function findRepoRoot(start = Deno.cwd()): Promise<string> {
  let current = resolve(start);
  while (true) {
    if (
      await exists(join(current, "AGENTS.md")) && await exists(join(current, "docs", "index.md"))
    ) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new Error("Could not find repo root.");
    }
    current = parent;
  }
}

export async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureDir(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

export function isoTimestamp(date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function filenameTimestamp(date = new Date()): string {
  return date.toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
}

export function repoRelative(root: string, path: string): string {
  return relative(resolve(root), resolve(path)).replaceAll("\\", "/");
}

export async function loadScorecard(root: string, vector: string): Promise<Scorecard> {
  const path = join(root, "scorecards", `${vector}.json`);
  const text = await Deno.readTextFile(path);
  return JSON.parse(text) as Scorecard;
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await Deno.readTextFile(path)) as T;
}

export async function writeJson(path: string, payload: unknown): Promise<void> {
  await ensureDir(dirname(path));
  const sorted = sortValue(payload);
  await Deno.writeTextFile(path, `${JSON.stringify(sorted, null, 2)}\n`);
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
      left.localeCompare(right)
    );
    return Object.fromEntries(entries.map(([key, item]) => [key, sortValue(item)]));
  }
  return value;
}

export async function runCommand(
  command: string[],
  options: { cwd?: string; env?: Record<string, string>; timeoutMs?: number } = {},
): Promise<CommandResult> {
  if (command.length === 0) {
    throw new Error("Cannot run an empty command.");
  }

  const started = Date.now();
  const child = new Deno.Command(command[0], {
    args: command.slice(1),
    cwd: options.cwd,
    env: options.env,
    stdout: "piped",
    stderr: "piped",
  }).spawn();

  let timedOut = false;
  const timeoutId = options.timeoutMs
    ? setTimeout(() => {
      timedOut = true;
      try {
        child.kill("SIGTERM");
      } catch {
        // Process already exited.
      }
    }, options.timeoutMs)
    : undefined;

  const output = await child.output();
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  return {
    command,
    cwd: options.cwd ?? Deno.cwd(),
    exit_code: timedOut ? 124 : output.code,
    stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
    duration_ms: Date.now() - started,
  };
}

export function countFailureLines(text: string): number {
  return text.split("\n").filter((line) => line.startsWith("ERROR:")).length;
}

export function tailLines(text: string, limit = 20): string[] {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  return lines.slice(-limit);
}

export function evaluateGuardrails(
  guardrails: Guardrail[],
  metrics: Record<string, unknown>,
): { passed: boolean; details: string[] } {
  const details: string[] = [];
  let passed = true;
  for (const guardrail of guardrails) {
    if (!(guardrail.metric in metrics)) {
      passed = false;
      details.push(`Missing metric '${guardrail.metric}' for guardrail evaluation.`);
      continue;
    }
    const actual = metrics[guardrail.metric];
    if (!compareValues(actual, guardrail.value, guardrail.op)) {
      passed = false;
      details.push(
        `Guardrail failed: ${guardrail.metric} ${guardrail.op} ${
          JSON.stringify(guardrail.value)
        } (actual ${JSON.stringify(actual)}).`,
      );
    }
  }
  return { passed, details };
}

function compareValues(
  actual: unknown,
  expected: unknown,
  op: Guardrail["op"],
): boolean {
  const actualNumber = toNumber(actual);
  const expectedNumber = toNumber(expected);

  if (actualNumber !== undefined && expectedNumber !== undefined) {
    switch (op) {
      case "eq":
        return actualNumber === expectedNumber;
      case "neq":
        return actualNumber !== expectedNumber;
      case "lt":
        return actualNumber < expectedNumber;
      case "lte":
        return actualNumber <= expectedNumber;
      case "gt":
        return actualNumber > expectedNumber;
      case "gte":
        return actualNumber >= expectedNumber;
    }
  }

  switch (op) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    default:
      return false;
  }
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

export function evaluatePromotionRule(
  rule: Scorecard["promotion_rule"],
  direction: Scorecard["target"]["direction"],
  baselineValue: unknown,
  candidateValue: unknown,
  guardrailsPassed: boolean,
): PromotionResult {
  if (!guardrailsPassed) {
    return { passed: false, summary: "Candidate failed one or more guardrails." };
  }
  const baseline = toNumber(baselineValue);
  const candidate = toNumber(candidateValue);
  if (baseline === undefined || candidate === undefined) {
    return { passed: false, summary: "Candidate target metric could not be evaluated." };
  }

  if (rule === "non_regressing") {
    const passed = direction === "min" ? candidate <= baseline : candidate >= baseline;
    return {
      passed,
      summary: passed
        ? "Candidate is non-regressing and guardrails hold."
        : "Candidate regressed on the target metric.",
    };
  }

  const passed = direction === "min" ? candidate < baseline : candidate > baseline;
  return {
    passed,
    summary: passed
      ? "Candidate improved on the target metric and guardrails hold."
      : "Candidate did not improve on the target metric.",
  };
}

export function sanitizeSlug(value: string): string {
  const slug = value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return slug || "value";
}

export async function uniqueJsonPath(dir: string, stem: string): Promise<string> {
  await ensureDir(dir);
  let candidate = join(dir, `${stem}.json`);
  let suffix = 1;
  while (await exists(candidate)) {
    candidate = join(dir, `${stem}-${suffix}.json`);
    suffix += 1;
  }
  return candidate;
}

export async function writeLedgerEntry(entry: LedgerEntry, ledgerDir: string): Promise<string> {
  const path = await uniqueJsonPath(ledgerDir, entry.id);
  await writeJson(path, entry);
  return path;
}

export async function latestLedgerEntryPath(
  ledgerDir: string,
  vector?: string,
): Promise<string | undefined> {
  if (!await exists(ledgerDir)) {
    return undefined;
  }
  const entries: string[] = [];
  for await (const file of Deno.readDir(ledgerDir)) {
    if (file.isFile && extname(file.name) === ".json") {
      entries.push(join(ledgerDir, file.name));
    }
  }
  entries.sort();
  if (!vector) {
    return entries.at(-1);
  }
  const filtered: string[] = [];
  for (const path of entries) {
    const payload = await readJson<Record<string, unknown>>(path);
    if (payload.vector === vector) {
      filtered.push(path);
    }
  }
  return filtered.at(-1);
}

export async function gitChangedFiles(
  root: string,
  baselineRef: string,
  candidateRef: string,
): Promise<string[]> {
  const result = await runCommand(["git", "diff", "--name-only", baselineRef, candidateRef], {
    cwd: root,
    timeoutMs: 30_000,
  });
  if (result.exit_code !== 0) {
    return [];
  }
  return result.stdout.split("\n").filter((line) => line.trim() !== "");
}

export async function freePort(): Promise<number> {
  const listener = Deno.listen({ hostname: "127.0.0.1", port: 0 });
  const { port } = listener.addr as Deno.NetAddr;
  listener.close();
  return port;
}

export function resolveRepoPath(root: string, path?: string): string | undefined {
  if (!path) {
    return undefined;
  }
  return isAbsolute(path) ? path : join(root, path);
}

export function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function readNumber(value: unknown): number {
  return toNumber(value) ?? 0;
}

export function readBoolean(value: unknown): boolean {
  return value === true;
}

export function isSourceCandidate(path: string): boolean {
  const file = basename(path);
  return file === "Makefile" || file === "deno.json" ||
    [".md", ".ts", ".sh", ".json"].includes(extname(path));
}
