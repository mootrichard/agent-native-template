import { join } from "node:path";
import assert from "node:assert/strict";

import { createRuntimeApp } from "../internal/runtimefixture/runtime.ts";
import { findRepoRoot } from "../internal/kernel/helpers.ts";

const root = await findRepoRoot();

Deno.test("runtime health endpoint reports ok", async () => {
  const app = createRuntimeApp(() => undefined);
  const response = app.handle(new Request("http://127.0.0.1/healthz"));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, "ok");
});

Deno.test("smoke script writes passing artifact", async () => {
  const artifactPath = join(await Deno.makeTempDir(), "runtime-smoke.json");
  const result = await new Deno.Command("./scripts/smoke.sh", {
    cwd: root,
    env: {
      ...Deno.env.toObject(),
      ARTIFACT_PATH: artifactPath,
      RUN_ID: `test-runtime-${Date.now()}`,
    },
    stdout: "piped",
    stderr: "piped",
  }).output();
  assert.equal(result.code, 0, new TextDecoder().decode(result.stderr));
  const payload = JSON.parse(await Deno.readTextFile(artifactPath));
  assert.equal(payload.smoke_pass, true);
  assert.equal(payload.health_status, 200);
  assert.equal(typeof payload.startup_ms, "number");
});
