// Test-only in-memory store used by unit tests.
// Application runtime uses Prisma + SQLite through prisma-client.ts.

export interface Database {
  users: Map<string, any>;
  creditCards: Map<string, any>;
  expenses: Map<string, any>;
  incomes: Map<string, any>;
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
