# Template Bootstrap

Owner: Repo Maintainers
Last verified: 2026-03-16

## Goal

A fresh user should be able to clone the template, verify the local toolchain, run the fast checks,
observe a healthy local service, and start building on top of the repo without adding
stack-specific dependencies or maintaining advanced governance machinery.

## Expected user journey

1. Clone the repository.
2. Run `deno task` to see the workflow surface.
3. Run `deno task install` to verify baseline prerequisites.
4. Run `deno task validate` to confirm the fast deterministic loop.
5. Run `deno task dev` or `deno task smoke`.
6. Observe a healthy local runtime fixture:
   - `/` returns a JSON fixture response
   - `/healthz` returns `{"status":"ok", ...}`
   - `/metrics` returns machine-readable runtime metrics
7. Optionally inspect transient score or smoke artifacts under `.tmp/improvement/`.

## Acceptance

- No framework or cloud bootstrap is required.
- Logs are local and deterministic under `.tmp/runtime/`.
- The repo itself explains how to validate and replace the fixture.
- Baseline validation and smoke commands do not dirty tracked files.
