import { CreditCard } from '@domain/entities/credit-card';
import { Expense } from '@domain/entities/expense';
import { Income } from '@domain/entities/income';
import { User } from '@domain/entities/user';

// Test-only in-memory store used by unit tests.
// Application runtime uses Prisma + SQLite through prisma-client.ts.

export interface Database {
  users: Map<string, User>;
  creditCards: Map<string, CreditCard>;
  expenses: Map<string, Expense>;
  incomes: Map<string, Income>;
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
