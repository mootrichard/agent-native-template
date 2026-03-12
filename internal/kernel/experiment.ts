import { join } from "node:path";

import {
  ensureDir,
  evaluatePromotionRule,
  filenameTimestamp,
  gitChangedFiles,
  isoTimestamp,
  loadScorecard,
  readJson,
  readString,
  repoRelative,
  runCommand,
  sanitizeSlug,
  writeLedgerEntry,
} from "./helpers.ts";
import type { ExperimentOptions, LedgerEntry } from "./types.ts";

export async function runExperiment(
  root: string,
  options: ExperimentOptions,
): Promise<{ entry: LedgerEntry; ledgerPath: string; promotable: boolean }> {
  const baselineRef = options.baselineRef ?? "HEAD";
  const scorecard = await loadScorecard(root, options.vector);
  const experimentId = `${filenameTimestamp()}-${sanitizeSlug(options.vector)}-${
    sanitizeSlug(options.candidateRef)
  }`;
  const worktreeRoot = join(root, ".tmp", "worktrees", experimentId);
  const baselinePath = join(worktreeRoot, "baseline");
  const candidatePath = join(worktreeRoot, "candidate");

  await ensureDir(worktreeRoot);
  try {
    await addWorktree(root, baselinePath, baselineRef);
    await addWorktree(root, candidatePath, options.candidateRef);

    const { score: baselineScore, artifactPath: baselineArtifact } = await scoreRef(
      root,
      baselinePath,
      options.vector,
      "baseline",
      experimentId,
    );
    const { score: candidateScore, artifactPath: candidateArtifact } = await scoreRef(
      root,
      candidatePath,
      options.vector,
      "candidate",
      experimentId,
    );

    const guardrailsPayload = candidateScore.guardrails as
      | { passed?: boolean; details?: string[] }
      | undefined;
    const promotion = evaluatePromotionRule(
      scorecard.promotion_rule,
      scorecard.target.direction,
      baselineScore[scorecard.target.metric],
      candidateScore[scorecard.target.metric],
      guardrailsPayload?.passed === true,
    );

    const entry: LedgerEntry = {
      id: experimentId,
      vector: options.vector,
      baseline_ref: baselineRef,
      candidate_ref: options.candidateRef,
      baseline: summarizeScore(scorecard.target.metric, baselineScore),
      candidate: summarizeScore(scorecard.target.metric, candidateScore),
      guardrails: {
        passed: guardrailsPayload?.passed === true,
        details: guardrailsPayload?.details ?? [],
      },
      verdict: promotion.passed ? "promote" : "revert",
      summary: promotion.summary,
      changed_files: await gitChangedFiles(root, baselineRef, options.candidateRef),
      artifacts: [
        repoRelative(root, baselineArtifact),
        repoRelative(root, candidateArtifact),
      ],
      created_at: isoTimestamp(),
    };
    const ledgerPath = await writeLedgerEntry(
      entry,
      join(root, "improvement", "ledger", "experiments"),
    );
    return { entry, ledgerPath, promotable: promotion.passed };
  } finally {
    await removeWorktree(root, candidatePath);
    await removeWorktree(root, baselinePath);
  }
}

async function addWorktree(root: string, path: string, ref: string): Promise<void> {
  const result = await runCommand(["git", "worktree", "add", "--detach", path, ref], {
    cwd: root,
    timeoutMs: 60_000,
  });
  if (result.exit_code !== 0) {
    throw new Error([result.stderr, result.stdout].filter(Boolean).join("\n").trim());
  }
}

async function removeWorktree(root: string, path: string): Promise<void> {
  if (!await Deno.stat(path).then(() => true).catch(() => false)) {
    return;
  }
  await runCommand(["git", "worktree", "remove", "--force", path], {
    cwd: root,
    timeoutMs: 60_000,
  });
}

async function scoreRef(
  root: string,
  worktreePath: string,
  vector: string,
  label: "baseline" | "candidate",
  experimentId: string,
): Promise<{ score: Record<string, unknown>; artifactPath: string }> {
  const worktreeArtifact = join(
    worktreePath,
    "docs",
    "generated",
    "improvement",
    `${vector}-score.json`,
  );
  const scoreResult = await runCommand(
    [
      "deno",
      "run",
      "-A",
      "./cmd/kernel.ts",
      "score",
      "--vector",
      vector,
      "--artifact-path",
      worktreeArtifact,
    ],
    { cwd: worktreePath, timeoutMs: 120_000 },
  );
  if (
    scoreResult.exit_code !== 0 &&
    !await Deno.stat(worktreeArtifact).then(() => true).catch(() => false)
  ) {
    throw new Error(
      `Score artifact missing for ${label}: ${scoreResult.stderr || scoreResult.stdout}`,
    );
  }
  const copiedArtifact = join(
    root,
    "docs",
    "generated",
    "improvement",
    "experiments",
    `${experimentId}-${label}-score.json`,
  );
  await ensureDir(join(root, "docs", "generated", "improvement", "experiments"));
  await Deno.copyFile(worktreeArtifact, copiedArtifact);
  return {
    score: await readJson<Record<string, unknown>>(worktreeArtifact),
    artifactPath: copiedArtifact,
  };
}

function summarizeScore(
  targetMetric: string,
  score: Record<string, unknown>,
): Record<string, unknown> {
  const summary: Record<string, unknown> = {
    [targetMetric]: score[targetMetric],
  };
  for (
    const key of [
      "exit_code",
      "docs_hygiene_exit_code",
      "health_status",
      "smoke_pass",
      "smoke_exit_code",
    ]
  ) {
    if (key in score) {
      summary[key] = score[key];
    }
  }
  return summary;
}

export function targetMetricFromEntry(entry: LedgerEntry): string {
  return Object.keys(entry.baseline).find((key) =>
    !["exit_code", "docs_hygiene_exit_code", "health_status", "smoke_pass", "smoke_exit_code"]
      .includes(key)
  ) ?? "";
}
