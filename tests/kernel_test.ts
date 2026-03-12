import { join } from "node:path";
import assert from "node:assert/strict";

import { runExperiment, targetMetricFromEntry } from "../internal/kernel/experiment.ts";
import { runLedgerSummary } from "../internal/kernel/gc.ts";
import {
  evaluateGuardrails,
  evaluatePromotionRule,
  latestLedgerEntryPath,
  writeLedgerEntry,
} from "../internal/kernel/helpers.ts";
import { findRepoRoot } from "../internal/kernel/helpers.ts";

const root = await findRepoRoot();

Deno.test("guardrail evaluation passes expected metrics", () => {
  const guardrails = [
    { metric: "exit_code", op: "eq", value: 0 },
    { metric: "artifact_written", op: "eq", value: true },
  ] as const;
  const result = evaluateGuardrails(guardrails as never, {
    exit_code: 0,
    artifact_written: true,
  });
  assert.equal(result.passed, true);
  assert.deepEqual(result.details, []);
});

Deno.test("promotion rule treats equal min target as non-regressing", () => {
  const result = evaluatePromotionRule("non_regressing", "min", 4, 4, true);
  assert.equal(result.passed, true);
});

Deno.test("ledger writes remain append-only", async () => {
  const ledgerDir = await Deno.makeTempDir();
  const first = await writeLedgerEntry({
    id: "example",
    vector: "docs-hygiene",
    baseline_ref: "HEAD",
    candidate_ref: "candidate",
    baseline: {},
    candidate: {},
    guardrails: { passed: true, details: [] },
    verdict: "promote",
    summary: "ok",
    changed_files: [],
    artifacts: [],
    created_at: new Date().toISOString(),
  }, ledgerDir);
  const second = await writeLedgerEntry({
    id: "example",
    vector: "docs-hygiene",
    baseline_ref: "HEAD",
    candidate_ref: "candidate",
    baseline: {},
    candidate: {},
    guardrails: { passed: true, details: [] },
    verdict: "promote",
    summary: "ok",
    changed_files: [],
    artifacts: [],
    created_at: new Date().toISOString(),
  }, ledgerDir);
  assert.notEqual(first, second);
});

Deno.test("score command writes docs-hygiene artifact", async () => {
  const artifactPath = join(await Deno.makeTempDir(), "docs-hygiene-score.json");
  const result = await new Deno.Command("deno", {
    args: [
      "run",
      "-A",
      "./cmd/kernel.ts",
      "score",
      "--vector",
      "docs-hygiene",
      "--artifact-path",
      artifactPath,
    ],
    cwd: root,
    stdout: "piped",
    stderr: "piped",
  }).output();
  assert.equal(result.code, 0);
  const payload = JSON.parse(await Deno.readTextFile(artifactPath));
  assert.equal(payload.vector_id, "docs-hygiene");
  assert.equal(payload.exit_code, 0);
  assert.equal(payload.failure_count, 0);
});

Deno.test("ledger summary reports counts", async () => {
  const tempDir = await Deno.makeTempDir();
  const ledgerDir = join(tempDir, "ledger");
  await Deno.mkdir(ledgerDir, { recursive: true });
  await Deno.writeTextFile(
    join(ledgerDir, "one.json"),
    JSON.stringify({
      vector: "docs-hygiene",
      verdict: "promote",
    }),
  );
  await Deno.writeTextFile(
    join(ledgerDir, "two.json"),
    JSON.stringify({
      vector: "runtime-boot",
      verdict: "revert",
      summary: "regressed",
    }),
  );
  const artifactPath = join(tempDir, "ledger-summary.json");
  const payload = await runLedgerSummary(root, { ledgerDir, artifactPath });
  assert.equal(payload.experiment_count, 2);
  assert.equal((payload.by_verdict as Record<string, number>).promote, 1);
  assert.equal((payload.by_verdict as Record<string, number>).revert, 1);
});

Deno.test("experiment command can compare synthetic snapshot refs", async () => {
  const stamp = `${Date.now()}`;
  const baselineRef = `codex/test-baseline-${stamp}`;
  const candidateRef = `codex/test-candidate-${stamp}`;
  const sourceDir = join(root, ".tmp", `test-experiment-source-${stamp}`);
  await Deno.mkdir(sourceDir, { recursive: true });
  await new Deno.Command("rsync", {
    args: ["-a", "--delete", "--exclude", ".git", "--exclude", ".tmp", `${root}/`, `${sourceDir}/`],
    stdout: "null",
    stderr: "null",
  }).output();
  await Deno.writeTextFile(
    join(sourceDir, "docs", "generated", "improvement", "phase-0-baseline.md"),
    `${await Deno.readTextFile(
      join(sourceDir, "docs", "generated", "improvement", "phase-0-baseline.md"),
    )}\n\nSynthetic experiment note.\n`,
  );

  const baselineCommit = await createSnapshot(root, root, "HEAD", baselineRef, "baseline snapshot");
  await createSnapshot(root, sourceDir, baselineCommit, candidateRef, "candidate snapshot");

  try {
    const { entry, ledgerPath, promotable } = await runExperiment(root, {
      vector: "docs-hygiene",
      baselineRef,
      candidateRef,
    });
    assert.equal(promotable, true);
    assert.equal(entry.verdict, "promote");
    assert.equal(targetMetricFromEntry(entry), "failure_count");
    assert.equal(
      await latestLedgerEntryPath(
        join(root, "improvement", "ledger", "experiments"),
        "docs-hygiene",
      ),
      ledgerPath,
    );
  } finally {
    await new Deno.Command("git", {
      args: ["update-ref", "-d", `refs/heads/${baselineRef}`],
      cwd: root,
      stdout: "null",
      stderr: "null",
    }).output();
    await new Deno.Command("git", {
      args: ["update-ref", "-d", `refs/heads/${candidateRef}`],
      cwd: root,
      stdout: "null",
      stderr: "null",
    }).output();
    await Deno.remove(sourceDir, { recursive: true }).catch(() => undefined);
  }
});

async function createSnapshot(
  repoRoot: string,
  worktree: string,
  parentRef: string,
  refName: string,
  message: string,
): Promise<string> {
  const indexFile = join(repoRoot, ".tmp", `${refName.replaceAll("/", "-")}.index`);
  await Deno.remove(indexFile).catch(() => undefined);
  await runGit(repoRoot, worktree, indexFile, ["read-tree", parentRef]);
  await runGit(repoRoot, worktree, indexFile, ["add", "-A", "."]);
  const tree = (await runGit(repoRoot, worktree, indexFile, ["write-tree"])).trim();
  const commit =
    (await runGit(repoRoot, worktree, indexFile, ["commit-tree", tree, "-p", parentRef], message))
      .trim();
  await Deno.remove(indexFile).catch(() => undefined);
  await new Deno.Command("git", {
    args: ["update-ref", `refs/heads/${refName}`, commit],
    cwd: repoRoot,
    stdout: "null",
    stderr: "null",
  }).output();
  return commit;
}

async function runGit(
  repoRoot: string,
  worktree: string,
  indexFile: string,
  args: string[],
  stdin?: string,
): Promise<string> {
  const child = new Deno.Command("git", {
    args,
    cwd: repoRoot,
    env: {
      ...Deno.env.toObject(),
      GIT_INDEX_FILE: indexFile,
      GIT_WORK_TREE: worktree,
    },
    stdin: stdin ? "piped" : "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn();
  if (stdin) {
    const writer = child.stdin.getWriter();
    await writer.write(new TextEncoder().encode(stdin));
    await writer.close();
  }
  const output = await child.output();
  assert.equal(output.code, 0, new TextDecoder().decode(output.stderr));
  return new TextDecoder().decode(output.stdout);
}
