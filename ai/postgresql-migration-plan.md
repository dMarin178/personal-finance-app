# PostgreSQL Migration Plan - Personal Finance App

## Goal
Migrate from SQLite to PostgreSQL safely, with minimal downtime risk and a clear rollback strategy.

## Current Context
- Prisma datasource is SQLite.
- Docker development and production currently use SQLite file paths.
- Helper query script is SQLite-specific.
- CI runs quality checks and E2E but should be aligned to PostgreSQL runtime.

## Migration Strategy Overview
Use a phased migration:
1. Prepare and back up.
2. Enable PostgreSQL in development.
3. Switch Prisma provider.
4. Rebaseline migrations for PostgreSQL.
5. Migrate data (if needed).
6. Update runtime tooling and docs.
7. Align CI/CD.
8. Roll out with rollback readiness.

## Phase 1 - Preparation (No Breaking Changes)
1. Create a branch dedicated to migration.
2. Back up SQLite database files.
3. Decide data strategy:
- Greenfield: start with empty PostgreSQL database.
- Data-preserving: copy existing SQLite data into PostgreSQL.
4. Temporarily avoid unrelated schema changes while migration is in progress.

## Phase 2 - Add PostgreSQL in Development
1. Add a postgres service in docker-compose for local development.
2. Configure:
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- Persistent volume
- Health check
3. Update app service DATABASE_URL to PostgreSQL DSN.
4. Expose port 5432 for local tooling.

Example DATABASE_URL:

```env
DATABASE_URL="postgresql://app_user:app_pass@postgres:5432/personal_finance?schema=public"
```

## Phase 3 - Switch Prisma Provider
1. In Prisma schema, change datasource provider from sqlite to postgresql.
2. Regenerate Prisma client.
3. Validate app boots and Prisma connects to PostgreSQL.

Commands:

```bash
npm run db:generate
```

## Phase 4 - Migrations (Important)
Because existing migration history is SQLite-specific, prefer a PostgreSQL baseline.

Recommended path:
1. Keep old SQLite migrations archived.
2. Generate a fresh PostgreSQL initial migration from current schema state.
3. Apply migration to PostgreSQL dev database.

Commands (typical):

```bash
npx prisma migrate dev --name init_postgres
```

## Phase 5 - Data Migration (If Preserving Data)
1. Build one-time import script.
2. Migrate in dependency order:
- User
- CreditCard
- Expense
- Income
3. Preserve IDs to keep relations intact.
4. Validate counts and sample records before cutover.

Validation checklist:
- Row counts match per table.
- Relation integrity is valid.
- Auth-critical records exist and are usable.

## Phase 6 - Runtime and Tooling Updates
1. Update production runtime to use PostgreSQL (managed service preferred).
2. Replace SQLite-only query helper with PostgreSQL-compatible approach.
3. Update environment examples and deployment docs.
4. Ensure seed script runs correctly against PostgreSQL.

## Phase 7 - CI/CD Alignment
1. Add PostgreSQL service to CI jobs that require DB access.
2. Run Prisma migration in CI before tests.
3. Run unit tests and E2E against PostgreSQL-backed environment.
4. Keep lint and build checks unchanged.

## Phase 8 - Rollout and Rollback
Rollout sequence:
1. Provision PostgreSQL.
2. Back up database.
3. Apply migrations.
4. Deploy app pointing to PostgreSQL.
5. Run smoke tests.

Rollback sequence:
1. Revert app deployment to previous image/tag.
2. Restore previous database snapshot if needed.
3. Re-run smoke checks on restored state.

## Definition of Done
- App runs in development with PostgreSQL.
- Prisma migrations work end-to-end in PostgreSQL.
- CI executes successfully using PostgreSQL.
- Production deployment path is documented.
- Rollback procedure is documented and tested.

## Suggested Execution Plan (PR Split)
1. PR 1: Dev-only migration baseline.
- Docker dev postgres service
- Prisma provider switch
- New initial postgres migration
- Env updates

2. PR 2: Data migration and CI alignment.
- One-time migration script
- CI postgres service and migration step
- Test adjustments

3. PR 3: Production rollout prep.
- Production compose or managed DB integration
- Deployment doc updates
- Rollback playbook

## Risks and Mitigations
- Risk: migration drift between SQLite and PostgreSQL
  - Mitigation: freeze schema changes during migration branch.
- Risk: data integrity issues during import
  - Mitigation: import with deterministic ordering and post-import validation checks.
- Risk: environment mismatch local vs CI vs production
  - Mitigation: use same PostgreSQL major version and consistent DATABASE_URL patterns.

## Quick Command Reference

```bash
npm run db:generate
npx prisma migrate dev --name init_postgres
npm run db:seed
npm run test:run
npm run e2e
```
