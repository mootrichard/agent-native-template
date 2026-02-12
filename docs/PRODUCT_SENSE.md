# Product sense (acceptance language)
Owner: Repo Maintainers
Last verified: 2026-02-12

Agents ship better when product intent is crisp and testable.

## Write acceptance as observable behavior
Good:
- “After starting the server, GET /health returns 200 OK with body ‘OK’.”
- “In the UI, creating an invoice shows it in the list within 1s.”

Avoid:
- “Added a HealthCheck struct”
- “Improved performance”

## “Definition of done”
- user-visible behavior exists (or internal change has a demonstrable effect),
- tests updated/added,
- docs updated if it affects understanding,
- validation evidence recorded in PR.
