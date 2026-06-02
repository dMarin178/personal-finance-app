---
name: finance-workflow
description: "Use when building finance features end-to-end across entity, use-case, repository, API route, and tests."
---

# Finance Workflow Skill

Use this workflow when adding a new capability such as card operations, expense flows, or user-scoped finance reports.

## Steps

1. Confirm domain impact
- Identify entities and invariants.
- Confirm ownership boundaries by user.

2. Implement application logic
- Add or update use-case in src/application/use-cases.
- Keep orchestration and validations in use-case layer.

3. Wire repositories
- Extend repository interfaces in src/domain/repositories.
- Implement infrastructure adapters under src/infrastructure/database/repositories.

4. Expose API route
- Add or update route under src/app/api.
- Validate input and map errors to stable HTTP responses.

5. Update frontend only if required
- Add pages/components/hooks/stores in src/presentation and src/app.
- Keep UX states explicit: loading, success, empty, error.

6. Add tests
- Unit tests for use-cases in tests/unit.
- Add route or integration tests if API behavior changed.

## Completion Criteria

- Feature works for authenticated user scope.
- No architecture boundary violations.
- Tests cover success and failure paths.
- API contract remains consistent for the frontend.
