import { createRuntimeApp } from "../../internal/runtimefixture/runtime.ts";

const port = Number(Deno.env.get("PORT") ?? "8000");
if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT '${Deno.env.get("PORT")}'.`);
}

const controller = new AbortController();
const app = createRuntimeApp();
app.log("startup", {
  port,
  startup_ms: app.startupMs(),
  startup_timestamp: app.startupTimestamp,
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  Deno.addSignalListener(signal, () => {
    app.log("shutdown", { reason: signal.toLowerCase() });
    controller.abort();
  });
}

const server = Deno.serve(
  {
    hostname: "127.0.0.1",
    port,
    signal: controller.signal,
  },
  (request) => app.handle(request),
);

await server.finished;
