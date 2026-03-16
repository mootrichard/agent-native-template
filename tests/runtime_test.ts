import assert from "node:assert/strict";

import { createRuntimeApp } from "../internal/runtimefixture/runtime.ts";

Deno.test("runtime health endpoint reports ok", async () => {
  const app = createRuntimeApp(() => undefined);
  const response = app.handle(new Request("http://127.0.0.1/healthz"));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, "ok");
});

Deno.test("runtime root endpoint returns service identity and request id", async () => {
  const app = createRuntimeApp(() => undefined);
  const response = app.handle(new Request("http://127.0.0.1/"));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id") !== null, true);
  const payload = await response.json();
  assert.equal(payload.service, "agent-native-template");
  assert.equal(typeof payload.request_id, "string");
});
