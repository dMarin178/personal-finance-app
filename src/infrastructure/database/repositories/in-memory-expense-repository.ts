import { Expense } from '@domain/entities/expense';
import { ExpenseRepository } from '@domain/repositories/expense-repository';
import { getDatabase } from '../connection';

export class InMemoryExpenseRepository implements ExpenseRepository {
  async create(expense: Expense): Promise<void> {
    const db = getDatabase();
    db.expenses.set(expense.id, expense);
  }

  async findById(id: string): Promise<Expense | null> {
    const db = getDatabase();
    return db.expenses.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Expense[]> {
    const db = getDatabase();
    const expenses: Expense[] = [];
    for (const expense of db.expenses.values()) {
      if (expense.userId === userId) {
        expenses.push(expense);
      }
    }
    return expenses;
  }

  async findByCardId(cardId: string): Promise<Expense[]> {
    const db = getDatabase();
    const expenses: Expense[] = [];
    for (const expense of db.expenses.values()) {
      if (expense.creditCardId === cardId) {
        expenses.push(expense);
      }
    }
    return expenses;
  }

  async update(expense: Expense): Promise<void> {
    const db = getDatabase();
    db.expenses.set(expense.id, expense);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    db.expenses.delete(id);
  }
}
