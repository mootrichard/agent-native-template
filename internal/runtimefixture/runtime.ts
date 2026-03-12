export interface RuntimeApp {
  handle(request: Request): Response;
  log(event: string, fields?: Record<string, unknown>): void;
  startupMs(): number;
  readonly startupTimestamp: string;
}

export function createRuntimeApp(
  logger: (entry: Record<string, unknown>) => void = (entry) => {
    console.log(JSON.stringify(entry));
  },
): RuntimeApp {
  const startedAt = Date.now();
  let lastRequestMs = 0;
  let requestCount = 0;
  const startupTimestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

  const log = (event: string, fields: Record<string, unknown> = {}) => {
    logger({
      event,
      timestamp: new Date().toISOString(),
      ...fields,
    });
  };

  const startupMs = () => Date.now() - startedAt;

  const handle = (request: Request): Response => {
    const started = Date.now();
    const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
    requestCount += 1;

    const url = new URL(request.url);
    let status = 200;
    let payload: Record<string, unknown>;
    if (url.pathname === "/") {
      payload = {
        message: "runtime fixture ready",
        service: "agent-native-template",
      };
    } else if (url.pathname === "/healthz") {
      payload = {
        request_count: requestCount,
        startup_ms: startupMs(),
        startup_timestamp: startupTimestamp,
        status: "ok",
      };
    } else if (url.pathname === "/metrics") {
      payload = {
        last_request_ms: lastRequestMs,
        request_count: requestCount,
        startup_ms: startupMs(),
        startup_timestamp: startupTimestamp,
        uptime_ms: startupMs(),
      };
    } else {
      status = 404;
      payload = {
        path: url.pathname,
        status: "not_found",
      };
    }

    const responsePayload = { ...payload, request_id: requestId };
    const latencyMs = Date.now() - started;
    lastRequestMs = latencyMs;
    log("request", {
      latency_ms: latencyMs,
      method: request.method,
      path: url.pathname,
      request_count: requestCount,
      request_id: requestId,
      status_code: status,
    });
    return new Response(JSON.stringify(responsePayload), {
      status,
      headers: {
        "content-type": "application/json",
        "x-request-id": requestId,
      },
    });
  };

  return {
    handle,
    log,
    startupMs,
    startupTimestamp,
  };
}
