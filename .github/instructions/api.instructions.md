---
description: "Use when editing API route handlers under src/app/api."
applyTo: "src/app/api/**/*.ts"
---

API handler rules:
- Parse and validate body/query data before calling use-cases.
- Keep handlers thin: orchestration only, no business rules.
- Map failures to consistent HTTP codes and stable error payloads.
- Avoid leaking stack traces and internal implementation details.
- Enforce authenticated user ownership checks on user-scoped resources.
- Keep response shapes stable to avoid frontend regressions.
