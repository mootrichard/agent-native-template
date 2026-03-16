import { join } from "node:path";
import assert from "node:assert/strict";

import { evaluateGuardrails, findRepoRoot } from "../internal/kernel/helpers.ts";

const root = await findRepoRoot();
const nestedValidate = Deno.env.get("CODEX_NESTED_VALIDATE") === "1";

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

Deno.test({
  name: "validate task stays clean in a fresh working copy",
  ignore: nestedValidate,
  fn: async () => {
  const tempRoot = await copyWorkingTree(root);
  try {
    const result = await runTask(tempRoot, ["validate"], {
      CODEX_NESTED_VALIDATE: "1",
    });
    assert.equal(result.code, 0, decode(result.stderr));
    await assertCleanWorktree(tempRoot);
  } finally {
    await Deno.remove(tempRoot, { recursive: true }).catch(() => undefined);
  }
  },
});

Deno.test("smoke task writes transient evidence and keeps the repo clean", async () => {
  const tempRoot = await copyWorkingTree(root);
  try {
    const result = await runTask(tempRoot, ["smoke"], {
      RUN_ID: `test-smoke-${Date.now()}`,
    });
    assert.equal(result.code, 0, decode(result.stderr));
    const payload = JSON.parse(
      await Deno.readTextFile(join(tempRoot, ".tmp", "improvement", "runtime-smoke.json")),
    );
    assert.equal(payload.smoke_pass, true);
    assert.equal(payload.health_status, 200);
    await assertCleanWorktree(tempRoot);
  } finally {
    await Deno.remove(tempRoot, { recursive: true }).catch(() => undefined);
  }
});

Deno.test("runtime-boot score writes to .tmp by default and keeps the repo clean", async () => {
  const tempRoot = await copyWorkingTree(root);
  try {
    const result = await runTask(tempRoot, ["score", "--vector", "runtime-boot"]);
    assert.equal(result.code, 0, decode(result.stderr));
    const payload = JSON.parse(
      await Deno.readTextFile(join(tempRoot, ".tmp", "improvement", "runtime-boot-score.json")),
    );
    assert.equal(payload.vector_id, "runtime-boot");
    assert.equal(payload.pass, true);
    await assertCleanWorktree(tempRoot);
  } finally {
    await Deno.remove(tempRoot, { recursive: true }).catch(() => undefined);
  }
});

Deno.test("publish-artifact is the explicit step that creates versioned evidence", async () => {
  const tempRoot = await copyWorkingTree(root);
  try {
    const scoreResult = await runTask(tempRoot, ["score", "--vector", "docs-hygiene"]);
    assert.equal(scoreResult.code, 0, decode(scoreResult.stderr));

    const publishResult = await runTask(tempRoot, [
      "publish-artifact",
      "--from",
      ".tmp/improvement/docs-hygiene-score.json",
      "--to",
      "docs/generated/improvement/docs-hygiene-score.json",
    ]);
    assert.equal(publishResult.code, 0, decode(publishResult.stderr));

    await Deno.stat(join(tempRoot, "docs", "generated", "improvement", "docs-hygiene-score.json"));
    const status = await gitStatus(tempRoot);
    assert.match(status, /docs\/generated\/improvement\/docs-hygiene-score\.json/);
  } finally {
    await Deno.remove(tempRoot, { recursive: true }).catch(() => undefined);
  }
});

async function copyWorkingTree(source: string): Promise<string> {
  const destination = join(await Deno.makeTempDir(), "repo");
  const copyResult = await new Deno.Command("bash", {
    args: [
      "-lc",
      'mkdir -p "$2" && cp -R "$1"/. "$2" && rm -rf "$2/.git" "$2/.tmp"',
      "bash",
      source,
      destination,
    ],
    stdout: "piped",
    stderr: "piped",
  }).output();
  assert.equal(copyResult.code, 0, decode(copyResult.stderr));

  await runGit(destination, ["init", "-q"]);
  await runGit(destination, ["config", "user.name", "Codex Test"]);
  await runGit(destination, ["config", "user.email", "codex-test@example.invalid"]);
  await runGit(destination, ["add", "-A"]);
  await runGit(destination, ["commit", "-qm", "snapshot"]);
  return destination;
}

async function runTask(
  repoRoot: string,
  args: string[],
  env: Record<string, string> = {},
): Promise<Deno.CommandOutput> {
  return await new Deno.Command("deno", {
    args: ["task", ...args],
    cwd: repoRoot,
    env: {
      ...Deno.env.toObject(),
      ...env,
    },
    stdout: "piped",
    stderr: "piped",
  }).output();
}

async function assertCleanWorktree(repoRoot: string): Promise<void> {
  const status = await gitStatus(repoRoot);
  assert.equal(status.trim(), "");
}

async function gitStatus(repoRoot: string): Promise<string> {
  const output = await runGit(repoRoot, ["status", "--short"]);
  return decode(output.stdout);
}

async function runGit(repoRoot: string, args: string[]): Promise<Deno.CommandOutput> {
  const output = await new Deno.Command("git", {
    args,
    cwd: repoRoot,
    stdout: "piped",
    stderr: "piped",
  }).output();
  assert.equal(output.code, 0, decode(output.stderr));
  return output;
}

function decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
