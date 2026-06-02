## Copilot Project Guidance

### Architecture Boundaries
- Keep domain rules in src/domain and src/application/use-cases.
- Keep API handlers thin and delegate logic to use-cases.
- Use repository interfaces from src/domain/repositories and concrete implementations from src/infrastructure.
- Avoid cross-layer shortcuts that bypass use-cases.

### API Conventions
- Validate route input before calling use-cases.
- Return consistent status codes: 400, 401, 404, and 500.
- Do not expose stack traces or internal errors in responses.
- Enforce user ownership checks for card, expense, and income resources.

### Frontend Conventions
- Keep UI state handling explicit: loading, empty, success, error.
- Keep component logic small and composable.
- Preserve existing UX patterns unless redesign is requested.

### Testing Expectations
- Add or update unit tests for any business logic change.
- Cover at least one failure path in addition to success path.
- Keep tests deterministic and focused on observable behavior.

### Implementation Rules
- Prefer minimal, targeted changes over wide refactors.
- Keep API response shapes stable when possible.
- Document assumptions and risks in the final summary for non-trivial tasks.

## Legacy Project Checklist

- [ ] Project structure created
- [ ] Core dependencies configured (Next.js, Tailwind, Zustand, Vitest, Playwright)
- [ ] Domain entities and repositories defined (User, CreditCard, Expense)
- [ ] Application use cases implemented (Auth, Card Management, Expenses)
- [ ] JWT authentication infrastructure set up
- [ ] In-memory database repositories created
- [ ] API routes established (register, login, create card)
- [ ] Frontend pages created (home, login, register, dashboard)
- [ ] Zustand stores created (auth, finance)
- [ ] Docker and Docker Compose configuration
- [ ] Development environment ready for testing
- [ ] README with setup instructions

## Next Steps to Complete

1. Add proper database integration (Prisma with PostgreSQL)
2. Complete API routes (get cards, add expenses, get expenses)
3. Add more UI components and pages
4. Implement unit tests
5. Implement E2E tests with Playwright
6. Add form validation
7. Add error handling and user feedback
8. Add loading states and skeleton components
9. Implement responsive layout improvements
10. Add deployment configuration
