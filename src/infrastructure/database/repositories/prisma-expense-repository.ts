import { Expense } from '@domain/entities/expense';
import { ExpenseRepository } from '@domain/repositories/expense-repository';
import prisma from '../prisma-client';

export class PrismaExpenseRepository implements ExpenseRepository {
  async create(expense: Expense): Promise<void> {
    await prisma.expense.create({
      data: {
        id: expense.id,
        userId: expense.userId,
        creditCardId: expense.creditCardId,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        createdAt: expense.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Expense | null> {
    const dbExpense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!dbExpense) return null;

    return new Expense(
      dbExpense.id,
      dbExpense.userId,
      dbExpense.creditCardId ?? undefined,
      dbExpense.description,
      dbExpense.amount,
      dbExpense.category,
      dbExpense.date,
      dbExpense.createdAt
    );
  }

  async findByUserId(userId: string): Promise<Expense[]> {
    const dbExpenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return dbExpenses.map(
      (expense) =>
        new Expense(
          expense.id,
          expense.userId,
          expense.creditCardId ?? undefined,
          expense.description,
          expense.amount,
          expense.category,
          expense.date,
          expense.createdAt
        )
    );
  }

  async findByCardId(cardId: string): Promise<Expense[]> {
    const dbExpenses = await prisma.expense.findMany({
      where: { creditCardId: cardId },
      orderBy: { date: 'desc' },
    });

    return dbExpenses.map(
      (expense) =>
        new Expense(
          expense.id,
          expense.userId,
          expense.creditCardId ?? undefined,
          expense.description,
          expense.amount,
          expense.category,
          expense.date,
          expense.createdAt
        )
    );
  }

  async update(expense: Expense): Promise<void> {
    await prisma.expense.update({
      where: { id: expense.id },
      data: {
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  }
}
