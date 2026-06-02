---
description: "Use when adding or modifying business logic, route handlers, or auth flows that require tests."
applyTo: "src/**/*.ts"
---

Testing rules:
- Add or update unit tests for use-case changes.
- Cover success path and at least one failure path.
- Keep tests focused and deterministic.
- Prefer repository fakes/in-memory repositories for use-case tests.
- When changing API contracts, add or update route-level tests where available.
