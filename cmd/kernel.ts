import { join } from "node:path";

import { runDocGardening, runFileSizeScan } from "../internal/kernel/gc.ts";
import {
  findRepoRoot,
  freePort,
  publishArtifact,
  readString,
  repoRelative,
  resolveRepoPath,
} from "../internal/kernel/helpers.ts";
import { defaultScoreArtifactPath, scoreVector, writeSmokeArtifact } from "../internal/kernel/score.ts";

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
    case "score":
      await runScore(rest);
      break;
    case "gc-docs":
      await runGCDocs(rest);
      break;
    case "gc-structure":
      await runGCStructure(rest);
      break;
    case "publish-artifact":
      await runPublishArtifact(rest);
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
    "usage: deno run -A ./cmd/kernel.ts <score|gc-docs|gc-structure|publish-artifact|free-port|write-smoke-artifact> [...]",
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

async function runScore(args: string[]) {
  const flags = parseFlags(args);
  const vector = stringFlag(flags, "vector", true)!;
  const artifactPath = resolveRepoPath(root, stringFlag(flags, "artifact-path")) ??
    defaultScoreArtifactPath(root, vector);
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

async function runPublishArtifact(args: string[]) {
  const flags = parseFlags(args);
  const sourcePath = resolveRepoPath(root, stringFlag(flags, "from", true))!;
  const destinationPath = resolveRepoPath(root, stringFlag(flags, "to", true))!;
  await publishArtifact(sourcePath, destinationPath);
  console.log(`[publish-artifact] ${repoRelative(root, sourcePath)} -> ${repoRelative(root, destinationPath)}`);
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
