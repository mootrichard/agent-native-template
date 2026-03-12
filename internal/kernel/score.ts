import { join } from "node:path";

import {
  countFailureLines,
  evaluateGuardrails,
  filenameTimestamp,
  freePort,
  isoTimestamp,
  loadScorecard,
  readBoolean,
  readJson,
  readNumber,
  readString,
  repoRelative,
  runCommand,
  tailLines,
  writeJson,
} from "./helpers.ts";
import type { Scorecard, SmokeArtifactInput } from "./types.ts";

export function defaultScoreArtifactPath(root: string, vector: string): string {
  return join(root, "docs", "generated", "improvement", `${vector}-score.json`);
}

export function defaultBaselineArtifactPath(root: string, vector: string): string {
  return join(root, "docs", "generated", "improvement", `${vector}-baseline.json`);
}

export async function scoreVector(
  root: string,
  vector: string,
  artifactPath = defaultScoreArtifactPath(root, vector),
): Promise<Record<string, unknown>> {
  const scorecard = await loadScorecard(root, vector);
  if (scorecard.id === "docs-hygiene") {
    return await scoreDocsHygiene(root, scorecard, artifactPath);
  }
  if (scorecard.id === "runtime-boot") {
    return await scoreRuntimeBoot(root, scorecard, artifactPath);
  }
  throw new Error(`Unsupported scorecard '${scorecard.id}'.`);
}

async function scoreDocsHygiene(
  root: string,
  scorecard: Scorecard,
  artifactPath: string,
): Promise<Record<string, unknown>> {
  const result = await runCommand(scorecard.evaluator.command, {
    cwd: root,
    timeoutMs: scorecard.budget_seconds * 1000,
  });
  const combined = [result.stdout, result.stderr].filter(Boolean).join("\n");
  const artifact: Record<string, unknown> = {
    artifact_path: repoRelative(root, artifactPath),
    artifact_written: true,
    command: scorecard.evaluator.command,
    duration_ms: result.duration_ms,
    exit_code: result.exit_code,
    failure_count: countFailureLines(combined),
    pass: false,
    stderr_tail: tailLines(result.stderr),
    stdout_tail: tailLines(result.stdout),
    target_direction: scorecard.target.direction,
    target_metric: scorecard.target.metric,
    timestamp: isoTimestamp(),
    vector_id: scorecard.id,
  };
  const guardrails = evaluateGuardrails(scorecard.guardrails, artifact);
  artifact.guardrails = guardrails;
  artifact.pass = result.exit_code === 0 && guardrails.passed;
  await writeJson(artifactPath, artifact);
  return artifact;
}

async function scoreRuntimeBoot(
  root: string,
  scorecard: Scorecard,
  artifactPath: string,
): Promise<Record<string, unknown>> {
  const smokeArtifact = join(root, "docs", "generated", "improvement", "runtime-smoke.json");
  const port = await freePort();
  const docsResult = await runCommand(["./scripts/validate-docs.sh"], {
    cwd: root,
    timeoutMs: scorecard.budget_seconds * 1000,
  });
  const smokeResult = await runCommand(scorecard.evaluator.command, {
    cwd: root,
    env: {
      ...Deno.env.toObject(),
      PORT: String(port),
      ARTIFACT_PATH: smokeArtifact,
      RUN_ID: `score-runtime-boot-${filenameTimestamp()}`,
    },
    timeoutMs: scorecard.budget_seconds * 1000,
  });

  const smokeData: Record<string, unknown> = await readJson<Record<string, unknown>>(smokeArtifact).catch(() => ({}));
  const artifact: Record<string, unknown> = {
    artifact_path: repoRelative(root, artifactPath),
    artifact_written: true,
    docs_hygiene_exit_code: docsResult.exit_code,
    duration_ms: smokeResult.duration_ms,
    health_status: readNumber(smokeData.health_status),
    log_path: readString(smokeData.log_path),
    metrics_status: readNumber(smokeData.metrics_status),
    pass: false,
    request_count: readNumber(smokeData.request_count),
    root_status: readNumber(smokeData.root_status),
    smoke_artifact: repoRelative(root, smokeArtifact),
    smoke_exit_code: smokeResult.exit_code,
    smoke_pass: readBoolean(smokeData.smoke_pass) && smokeResult.exit_code === 0,
    startup_ms: readNumber(smokeData.startup_ms) || (scorecard.budget_seconds * 1000) + 1,
    stderr_tail: tailLines(smokeResult.stderr),
    stdout_tail: tailLines(smokeResult.stdout),
    target_direction: scorecard.target.direction,
    target_metric: scorecard.target.metric,
    timestamp: isoTimestamp(),
    vector_id: scorecard.id,
  };
  const guardrails = evaluateGuardrails(scorecard.guardrails, artifact);
  artifact.guardrails = guardrails;
  artifact.pass = smokeResult.exit_code === 0 && docsResult.exit_code === 0 && guardrails.passed;
  await writeJson(artifactPath, artifact);
  return artifact;
}

export async function baselineVector(
  root: string,
  vector: string,
  artifactPath = defaultBaselineArtifactPath(root, vector),
): Promise<Record<string, unknown>> {
  const scoreArtifact = await scoreVector(root, vector);
  const headResult = await runCommand(["git", "rev-parse", "HEAD"], {
    cwd: root,
    timeoutMs: 10_000,
  });
  const targetMetric = readString(scoreArtifact.target_metric);
  const artifact: Record<string, unknown> = {
    artifact_path: repoRelative(root, artifactPath),
    baseline_ref: headResult.exit_code === 0 ? headResult.stdout.trim() : "HEAD",
    pass: scoreArtifact.pass,
    score_artifact: readString(scoreArtifact.artifact_path),
    target_metric: targetMetric,
    target_value: scoreArtifact[targetMetric],
    timestamp: isoTimestamp(),
    vector_id: vector,
  };
  await writeJson(artifactPath, artifact);
  return artifact;
}

export async function writeSmokeArtifact(
  root: string,
  input: SmokeArtifactInput,
): Promise<Record<string, unknown>> {
  const health: Record<string, unknown> = await readJson<Record<string, unknown>>(input.healthPath).catch(() => ({}));
  const rootResponse: Record<string, unknown> = await readJson<Record<string, unknown>>(input.rootPath).catch(() => ({}));
  const metrics: Record<string, unknown> = await readJson<Record<string, unknown>>(input.metricsPath).catch(() => ({}));
  const artifact: Record<string, unknown> = {
    base_url: input.baseUrl,
    health,
    health_status: input.healthStatus,
    log_path: repoRelative(root, input.logPath),
    metrics,
    metrics_path: repoRelative(root, input.metricsPath),
    metrics_status: input.metricsStatus,
    port: input.port,
    request_count: readNumber(metrics.request_count || health.request_count),
    root_response: rootResponse,
    root_response_path: repoRelative(root, input.rootPath),
    root_status: input.rootStatus,
    run_dir: repoRelative(root, input.runDir),
    run_id: input.runId,
    smoke_pass: input.healthStatus === 200 &&
      input.rootStatus === 200 &&
      input.metricsStatus === 200 &&
      readString(health.status) === "ok" &&
      readString(rootResponse.service) === "agent-native-template",
    startup_ms: readNumber(health.startup_ms || metrics.startup_ms),
    timestamp: isoTimestamp(),
  };
  await writeJson(input.artifactPath, artifact);
  return artifact;
}
