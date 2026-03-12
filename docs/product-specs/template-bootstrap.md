# Template Bootstrap
Owner: Repo Maintainers
Last verified: 2026-03-12

## Goal
A fresh user should be able to clone the template, verify the local toolchain, run the fast checks, and observe a healthy local service without adding stack-specific dependencies.

## Expected user journey
1. Clone the repository.
2. Run `deno task` to see the workflow surface.
3. Run `deno task install` to verify `deno`, `git`, and `curl`.
4. Run `deno task test` and `deno task validate` to confirm the fast deterministic loop.
5. Run `deno task dev` or `deno task smoke`.
6. Observe a healthy local runtime fixture:
   - `/` returns a JSON fixture response
   - `/healthz` returns `{"status":"ok", ...}`
   - `/metrics` returns machine-readable runtime metrics

## Acceptance
- No framework or cloud bootstrap is required.
- Logs are local and deterministic under `.tmp/runtime/`.
- The repo itself explains how to validate and replace the fixture.
