import { resolve } from "node:path";

import {
  findRepoRoot,
  isoTimestamp,
  readJson,
  repoRelative,
  resolveRepoPath,
  writeJson,
} from "../internal/kernel/helpers.ts";

type VectorId = "automation-harness-health";

interface ParsedFlags {
  values: Record<string, string | boolean>;
}

interface CheckResult {
  id: string;
  location: string;
  description: string;
  observed: string;
  passed: boolean;
}

interface VectorDefinition {
  summary: string;
  checks: Array<(root: string) => Promise<CheckResult>>;
}

type JsonRecord = Record<string, unknown>;

const VECTOR_DEFINITIONS: Record<VectorId, VectorDefinition> = {
  "automation-harness-health": {
    summary:
      "Keep proposal artifacts, change packages, registry contracts, and review handoff inputs aligned.",
    checks: [
      textCheck(
        "kernel-cli-propose-command",
        "cmd/kernel.ts",
        "The kernel CLI exposes a propose command.",
        /case "propose":[\s\S]*await runPropose\(rest\)/m,
      ),
      textCheck(
        "deno-task-propose",
        "deno.json",
        "The task surface exposes deno task propose.",
        /"propose": "deno run -A \.\/cmd\/kernel\.ts propose"/m,
      ),
      textCheck(
        "proposal-handoff-markdown",
        "internal/kernel/proposal.ts",
        "Proposal generation renders a structured change-package handoff.",
        /`Change Package`,[\s\S]*`- proposal: \$\{input\.change\.path\}\/proposal\.md`/m,
      ),
      textCheck(
        "proposal-governance-boundary",
        "internal/kernel/proposal.ts",
        "Proposal artifacts encode the planning or execution boundary.",
        /execution_boundary:\s*"planner_proposes_executor_acts_humans_govern"/m,
      ),
      textCheck(
        "change-package-scaffold",
        "internal/kernel/change_package.ts",
        "Change-package scaffolding writes proposal, design, tasks, and delta specs.",
        /proposal\.md[\s\S]*design\.md[\s\S]*tasks\.md[\s\S]*specs/m,
      ),
      registryCheck(
        "registry-default-project",
        "projects/registry.json",
        "Registry defines a default template project.",
        (registry) => pathValue(registry, ["default_project"]) === "template",
      ),
      registryCheck(
        "registry-template-workflow",
        "projects/registry.json",
        "Registry points the template project at the root workflow contract.",
        (registry) =>
          pathValue(registry, ["projects", "template", "workflow", "path"]) === "AGENTS.md",
      ),
      registryCheck(
        "registry-template-scorecards",
        "projects/registry.json",
        "Registry wires the template project to the base scorecards, including automation-harness-health.",
        (registry) => {
          const scorecards = stringArray(
            pathValue(registry, ["projects", "template", "scorecards"]),
          );
          return ["docs-hygiene", "runtime-boot", "automation-harness-health"].every((scorecard) =>
            scorecards.includes(scorecard)
          );
        },
      ),
      textCheck(
        "project-registry-doc-contract",
        "docs/product-specs/project-registry.md",
        "Product specs define the local project registry as the routing contract.",
        /projects\/registry\.json[\s\S]*workflow[\s\S]*validation[\s\S]*scorecards/m,
      ),
      textCheck(
        "pr-review-harness-verdicts",
        "docs/product-specs/pr-review-merge-harness.md",
        "PR harness docs define structured verdicts.",
        /`allow`[\s\S]*`reject_retryable`[\s\S]*`escalate_human`/m,
      ),
      markdownSectionCheck(
        "pr-template-improvement-summary",
        ".github/pull_request_template.md",
        "PR template includes an improvement summary section.",
        "Improvement Summary",
      ),
      markdownSectionCheck(
        "pr-template-baseline",
        ".github/pull_request_template.md",
        "PR template includes a baseline section.",
        "Baseline",
      ),
      markdownSectionCheck(
        "pr-template-candidate",
        ".github/pull_request_template.md",
        "PR template includes a candidate section.",
        "Candidate",
      ),
      markdownSectionCheck(
        "pr-template-guardrails",
        ".github/pull_request_template.md",
        "PR template includes a guardrails section.",
        "Guardrails",
      ),
      markdownSectionCheck(
        "pr-template-validation",
        ".github/pull_request_template.md",
        "PR template includes a validation section.",
        "Validation",
      ),
      markdownSectionCheck(
        "pr-template-evidence",
        ".github/pull_request_template.md",
        "PR template includes an evidence section.",
        "Evidence",
      ),
      markdownSectionCheck(
        "pr-template-governance",
        ".github/pull_request_template.md",
        "PR template includes a governance section.",
        "Governance",
      ),
      textCheck(
        "readme-explains-proposal-layer",
        "README.md",
        "README explains the proposal and change-package layer.",
        /deno task propose[\s\S]*projects\/registry\.json[\s\S]*changes\//m,
      ),
    ],
  },
};

const root = await findRepoRoot();
const flags = parseFlags(Deno.args);
const vector = stringFlag(flags, "vector", true) as VectorId;
const artifactPath = resolveRepoPath(root, stringFlag(flags, "artifact-path", true))!;
const definition = VECTOR_DEFINITIONS[vector];
if (!definition) {
  throw new Error(`Unsupported vector '${vector}'.`);
}

const checks = await Promise.all(definition.checks.map((check) => check(root)));
const missingContracts = checks.filter((check) => !check.passed).length;
const payload = {
  artifact_path: repoRelative(root, artifactPath),
  artifact_written: true,
  checks,
  contract_pass: missingContracts === 0,
  missing_contracts: missingContracts,
  passed_contracts: checks.length - missingContracts,
  required_contracts: checks.length,
  summary: definition.summary,
  timestamp: isoTimestamp(),
  vector_id: vector,
};

await writeJson(artifactPath, payload);
if (missingContracts > 0) {
  Deno.exit(1);
}

function parseFlags(args: string[]): ParsedFlags {
  const values: Record<string, string | boolean> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      values[key] = true;
      continue;
    }
    values[key] = next;
    index += 1;
  }
  return { values };
}

function stringFlag(flags: ParsedFlags, key: string, required = false): string | undefined {
  const value = flags.values[key];
  if (typeof value === "string") {
    return value;
  }
  if (required) {
    throw new Error(`Missing required flag --${key}.`);
  }
  return undefined;
}

function textCheck(
  id: string,
  location: string,
  description: string,
  pattern: RegExp,
): (root: string) => Promise<CheckResult> {
  return async (root) => {
    const path = resolve(root, location);
    const text = await Deno.readTextFile(path).catch(() => "");
    return {
      id,
      location,
      description,
      observed: text === "" ? "missing" : pattern.test(text) ? "matched" : "pattern_missing",
      passed: text !== "" && pattern.test(text),
    };
  };
}

function markdownSectionCheck(
  id: string,
  location: string,
  description: string,
  section: string,
): (root: string) => Promise<CheckResult> {
  return async (root) => {
    const path = resolve(root, location);
    const text = await Deno.readTextFile(path).catch(() => "");
    const heading = new RegExp(`^## ${escapeRegExp(section)}$`, "m");
    return {
      id,
      location,
      description,
      observed: text === ""
        ? "missing"
        : heading.test(text)
        ? "section_present"
        : "section_missing",
      passed: text !== "" && heading.test(text),
    };
  };
}

function registryCheck(
  id: string,
  location: string,
  description: string,
  predicate: (registry: JsonRecord) => boolean,
): (root: string) => Promise<CheckResult> {
  return async (root) => {
    const path = resolve(root, location);
    const registry = await readJson<JsonRecord>(path).catch(() => undefined);
    const passed = !!registry && predicate(registry);
    return {
      id,
      location,
      description,
      observed: registry ? JSON.stringify(registry) : "missing",
      passed,
    };
  };
}

function pathValue(record: JsonRecord, path: string[]): unknown {
  let current: unknown = record;
  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as JsonRecord)[segment];
  }
  return current;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
