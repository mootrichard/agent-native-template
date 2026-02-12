# Security
Owner: Repo Maintainers
Last verified: 2026-02-12

## Threat model (baseline)
Assume:
- inputs are adversarial or malformed,
- secrets leak if logged carelessly,
- dependencies are potential supply-chain vectors.

## Boundary parsing (non-negotiable)
Untrusted data must be parsed/validated at system boundaries into refined internal types.
Internal code should not “YOLO” guess shapes.

## Secure defaults
- No implicit trust in client-provided identifiers.
- Prefer explicit allowlists for cross-domain access.
- Sanitized, structured logging.

## Continuous security review (agentic posture)
Adopt a continuous loop:
- scan changes,
- reason about exploitability,
- validate in a sandbox where possible,
- propose targeted patches for review.

## Disclosure / response
Document:
- how to report issues,
- how patches are validated,
- how releases are tracked.
