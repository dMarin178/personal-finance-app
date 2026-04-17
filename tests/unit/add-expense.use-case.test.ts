import { describe, expect, it, beforeEach } from 'vitest';
import { AddExpenseUseCase } from '@application/use-cases/add-expense';
import { InMemoryExpenseRepository } from '@infrastructure/database/repositories/in-memory-expense-repository';
import { InMemoryCreditCardRepository } from '@infrastructure/database/repositories/in-memory-credit-card-repository';
import { CreditCard } from '@domain/entities/credit-card';
import { resetDatabase } from '@infrastructure/database/connection';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

describe('AddExpenseUseCase', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('adds a card-linked expense and updates card balance', async () => {
    const expenseRepository = new InMemoryExpenseRepository();
    const creditCardRepository = new InMemoryCreditCardRepository();
    const useCase = new AddExpenseUseCase(expenseRepository, creditCardRepository);

    const card = CreditCard.create('user-1', 'Visa', 1000, 300);
    await creditCardRepository.create(card);

    const result = await useCase.execute({
      userId: 'user-1',
      creditCardId: card.id,
      description: 'Groceries',
      amount: 120,
      category: 'Food',
    });

    expect(result.success).toBe(true);
    expect(result.expenseId).toBeDefined();

    const savedExpense = await expenseRepository.findById(result.expenseId!);
    expect(savedExpense).not.toBeNull();
    expect(savedExpense?.userId).toBe('user-1');
    expect(savedExpense?.creditCardId).toBe(card.id);

    const updatedCard = await creditCardRepository.findById(card.id);
    expect(updatedCard?.currentBalance).toBe(120);
  });

  it('adds a direct monthly expense without changing card balances', async () => {
    const expenseRepository = new InMemoryExpenseRepository();
    const creditCardRepository = new InMemoryCreditCardRepository();
    const useCase = new AddExpenseUseCase(expenseRepository, creditCardRepository);

    const card = CreditCard.create('user-1', 'Mastercard', 2000, 400);
    await creditCardRepository.create(card);

    const result = await useCase.execute({
      userId: 'user-1',
      description: 'Internet bill',
      amount: 55,
      category: 'Services',
    });

    expect(result.success).toBe(true);

    const savedExpense = await expenseRepository.findById(result.expenseId!);
    expect(savedExpense?.creditCardId).toBeUndefined();

    const unchangedCard = await creditCardRepository.findById(card.id);
    expect(unchangedCard?.currentBalance).toBe(0);
  });

  it('rejects an expense when it exceeds credit limit', async () => {
    const expenseRepository = new InMemoryExpenseRepository();
    const creditCardRepository = new InMemoryCreditCardRepository();
    const useCase = new AddExpenseUseCase(expenseRepository, creditCardRepository);

    const card = CreditCard.create('user-1', 'Amex', 500, 200);
    card.currentBalance = 450;
    await creditCardRepository.create(card);

    const result = await useCase.execute({
      userId: 'user-1',
      creditCardId: card.id,
      description: 'Large expense',
      amount: 100,
      category: 'Other',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Expense would exceed credit limit');
  });

  it('rolls back created expense if card update fails', async () => {
    const expenseRepository = new InMemoryExpenseRepository();
    const baseCreditCardRepository = new InMemoryCreditCardRepository();

    const card = CreditCard.create('user-1', 'Visa', 1000, 300);
    await baseCreditCardRepository.create(card);

    const failingCreditCardRepository: CreditCardRepository = {
      create: (creditCard) => baseCreditCardRepository.create(creditCard),
      findById: (id) => baseCreditCardRepository.findById(id),
      findByUserId: (userId) => baseCreditCardRepository.findByUserId(userId),
      update: async () => {
        throw new Error('DB update failed');
      },
      delete: (id) => baseCreditCardRepository.delete(id),
    };

    const useCase = new AddExpenseUseCase(expenseRepository, failingCreditCardRepository);

    const result = await useCase.execute({
      userId: 'user-1',
      creditCardId: card.id,
      description: 'Gym',
      amount: 50,
      category: 'Health',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to add expense');

    const userExpenses = await expenseRepository.findByUserId('user-1');
    expect(userExpenses).toHaveLength(0);
  });
});
