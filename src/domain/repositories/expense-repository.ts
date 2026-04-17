import { Expense } from '../entities/expense';

export interface ExpenseRepository {
  create(expense: Expense): Promise<void>;
  findById(id: string): Promise<Expense | null>;
  findByUserId(userId: string): Promise<Expense[]>;
  findByCardId(cardId: string): Promise<Expense[]>;
  update(expense: Expense): Promise<void>;
  delete(id: string): Promise<void>;
}
