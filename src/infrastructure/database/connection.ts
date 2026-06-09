// Test-only in-memory store used by unit tests.
// Application runtime uses Prisma + SQLite through prisma-client.ts.

export interface Database {
  users: Map<string, unknown>;
  creditCards: Map<string, unknown>;
  expenses: Map<string, unknown>;
  incomes: Map<string, unknown>;
}

let db: Database = {
  users: new Map(),
  creditCards: new Map(),
  expenses: new Map(),
  incomes: new Map(),
};

export function getDatabase(): Database {
  return db;
}

export function resetDatabase(): void {
  db = {
    users: new Map(),
    creditCards: new Map(),
    expenses: new Map(),
    incomes: new Map(),
  };
}
