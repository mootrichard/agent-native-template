import { join } from "node:path";

import { runExperiment, targetMetricFromEntry } from "../internal/kernel/experiment.ts";
import { runDocGardening, runFileSizeScan, runLedgerSummary } from "../internal/kernel/gc.ts";
import { defaultProposalArtifactPath, proposalForVector } from "../internal/kernel/proposal.ts";
import {
  findRepoRoot,
  freePort,
  readString,
  repoRelative,
  resolveRepoPath,
} from "../internal/kernel/helpers.ts";
import { promoteLatest, revertLatest } from "../internal/kernel/promotion.ts";
import { baselineVector, scoreVector, writeSmokeArtifact } from "../internal/kernel/score.ts";

interface ParsedFlags {
  positionals: string[];
  values: Record<string, string | boolean>;
}

const root = await findRepoRoot();

if (Deno.args.length === 0) {
  usage();
  Deno.exit(1);
}

const [command, ...rest] = Deno.args;
try {
  switch (command) {
    case "baseline":
      await runBaseline(rest);
      break;
    case "score":
      await runScore(rest);
      break;
    case "experiment":
      await runExperimentCommand(rest);
      break;
    case "promote":
      await runPromote(rest);
      break;
    case "propose":
      await runPropose(rest);
      break;
    case "revert":
      await runRevert(rest);
      break;
    case "gc-docs":
      await runGCDocs(rest);
      break;
    case "gc-structure":
      await runGCStructure(rest);
      break;
    case "gc-ledger":
      await runGCLedger(rest);
      break;
    case "free-port":
      console.log(await freePort());
      break;
    case "write-smoke-artifact":
      await runWriteSmokeArtifact(rest);
      break;
    default:
      usage();
      Deno.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  Deno.exit(1);
}

function usage() {
  console.error(
    "usage: deno run -A ./cmd/kernel.ts <baseline|score|experiment|promote|propose|revert|gc-docs|gc-structure|gc-ledger|free-port|write-smoke-artifact> [...]",
  );
}

function parseFlags(args: string[]): ParsedFlags {
  const values: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
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
  return { positionals, values };
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

function booleanFlag(flags: ParsedFlags, key: string): boolean {
  return flags.values[key] === true;
}

async function runBaseline(args: string[]) {
  const flags = parseFlags(args);
  const vector = stringFlag(flags, "vector", true)!;
  const artifactPath = resolveRepoPath(root, stringFlag(flags, "artifact-path"));
  const artifact = await baselineVector(root, vector, artifactPath);
  console.log(
    `[baseline:${vector}] pass=${artifact.pass} ${artifact.target_metric}=${artifact.target_value} artifact=${artifact.artifact_path}`,
  );
}

async function runScore(args: string[]) {
  const flags = parseFlags(args);
  const vector = stringFlag(flags, "vector", true)!;
  const artifactPath = resolveRepoPath(root, stringFlag(flags, "artifact-path"));
  const artifact = await scoreVector(root, vector, artifactPath);
  const targetMetric = readString(artifact.target_metric);
  console.log(
    `[${artifact.vector_id}] pass=${artifact.pass} ${targetMetric}=${
      artifact[targetMetric]
    } artifact=${artifact.artifact_path}`,
  );
  if (artifact.pass !== true) {
    throw new Error(`Scorecard ${vector} failed.`);
  }
}

async function runExperimentCommand(args: string[]) {
  const flags = parseFlags(args);
  const vector = stringFlag(flags, "vector", true)!;
  const candidateRef = stringFlag(flags, "candidate-ref", true)!;
  const baselineRef = stringFlag(flags, "baseline-ref") ?? "HEAD";
  const { entry, ledgerPath, promotable } = await runExperiment(root, {
    vector,
    baselineRef,
    candidateRef,
  });
  const targetMetric = targetMetricFromEntry(entry);
  console.log(
    `[experiment:${entry.vector}] verdict=${entry.verdict} ${targetMetric}: baseline=${
      entry.baseline[targetMetric]
    } candidate=${entry.candidate[targetMetric]} ledger=${repoRelative(root, ledgerPath)}`,
  );
  if (!promotable) {
    throw new Error("Candidate is not promotable.");
  }
}

async function runPromote(args: string[]) {
  const flags = parseFlags(args);
  const message = await promoteLatest(root, {
    ledgerPath: resolveRepoPath(root, stringFlag(flags, "ledger")),
    vector: stringFlag(flags, "vector"),
  });
  console.log(message);
}

async function runPropose(args: string[]) {
  const flags = parseFlags(args);
  const vector = stringFlag(flags, "vector", true)!;
  const artifactPath = resolveRepoPath(root, stringFlag(flags, "artifact-path")) ??
    defaultProposalArtifactPath(root, vector);
  const proposal = await proposalForVector(root, vector, {
    artifactPath,
    scoreArtifactPath: resolveRepoPath(root, stringFlag(flags, "score-artifact")),
    baselineArtifactPath: resolveRepoPath(root, stringFlag(flags, "baseline-artifact")),
    projectKey: stringFlag(flags, "project"),
  });
  console.log(
    `[proposal:${proposal.vector}] recommendation=${proposal.recommendation} artifact=${proposal.artifact_path}`,
  );
}

async function runRevert(args: string[]) {
  const flags = parseFlags(args);
  const artifact = await revertLatest(root, {
    ledgerPath: resolveRepoPath(root, stringFlag(flags, "ledger")),
    vector: stringFlag(flags, "vector"),
    deleteBranch: booleanFlag(flags, "delete-branch"),
  });
  console.log(
    `Recorded revert artifact at ${artifact.artifact_path} (deleted_branch=${artifact.deleted_branch})`,
  );
}

async function runGCDocs(args: string[]) {
  const flags = parseFlags(args);
  const payload = await runDocGardening(root, {
    maxAgeDays: Number(stringFlag(flags, "max-age-days") ?? "180"),
    mode: (stringFlag(flags, "mode") as "warn" | "fail" | undefined) ?? "warn",
    artifactPath: resolveRepoPath(root, stringFlag(flags, "artifact-path")),
  });
  console.log(
    `[gc-docs] stale_count=${payload.stale_count} missing_metadata=${
      (payload.missing_metadata as string[]).length
    } artifact=${payload.artifact_path}`,
  );
}

async function runGCStructure(args: string[]) {
  const flags = parseFlags(args);
  const payload = await runFileSizeScan(root, {
    maxLines: Number(stringFlag(flags, "max-lines") ?? "300"),
    artifactPath: resolveRepoPath(root, stringFlag(flags, "artifact-path")),
  });
  console.log(
    `[gc-structure] oversized_count=${payload.oversized_count} artifact=${payload.artifact_path}`,
  );
}

async function runGCLedger(args: string[]) {
  const flags = parseFlags(args);
  const payload = await runLedgerSummary(root, {
    ledgerDir: resolveRepoPath(root, stringFlag(flags, "ledger-dir")),
    artifactPath: resolveRepoPath(root, stringFlag(flags, "artifact-path")),
  });
  console.log(
    `[gc-ledger] experiment_count=${payload.experiment_count} artifact=${payload.artifact_path}`,
  );
}

async function runWriteSmokeArtifact(args: string[]) {
  const flags = parseFlags(args);
  const artifactPath = resolveRepoPath(root, stringFlag(flags, "artifact-path", true))!;
  const artifact = await writeSmokeArtifact(root, {
    artifactPath,
    baseUrl: stringFlag(flags, "base-url", true)!,
    runId: stringFlag(flags, "run-id", true)!,
    runDir: resolveRepoPath(root, stringFlag(flags, "run-dir", true))!,
    logPath: resolveRepoPath(root, stringFlag(flags, "log-path", true))!,
    healthPath: resolveRepoPath(root, stringFlag(flags, "health-path", true))!,
    rootPath: resolveRepoPath(root, stringFlag(flags, "root-path", true))!,
    metricsPath: resolveRepoPath(root, stringFlag(flags, "metrics-path", true))!,
    port: Number(stringFlag(flags, "port", true)!),
    healthStatus: Number(stringFlag(flags, "health-status", true)!),
    rootStatus: Number(stringFlag(flags, "root-status", true)!),
    metricsStatus: Number(stringFlag(flags, "metrics-status", true)!),
  });
  console.log(
    `[runtime-smoke] pass=${artifact.smoke_pass} startup_ms=${artifact.startup_ms} artifact=${
      repoRelative(root, artifactPath)
    }`,
  );
  if (artifact.smoke_pass !== true) {
    throw new Error("Runtime smoke failed.");
  }
}
