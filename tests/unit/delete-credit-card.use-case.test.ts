import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteCreditCardUseCase } from '@application/use-cases/delete-credit-card';
import { resetDatabase } from '@infrastructure/database/connection';
import { InMemoryCreditCardRepository } from '@infrastructure/database/repositories/in-memory-credit-card-repository';
import { CreditCard } from '@domain/entities/credit-card';

describe('DeleteCreditCardUseCase', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('deletes a credit card that belongs to the user', async () => {
    const creditCardRepository = new InMemoryCreditCardRepository();
    const useCase = new DeleteCreditCardUseCase(creditCardRepository);

    const card = CreditCard.create('user-1', 'Visa', 1000, 300);
    await creditCardRepository.create(card);

    const result = await useCase.execute({
      cardId: card.id,
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(await creditCardRepository.findById(card.id)).toBeNull();
  });

  it('rejects deleting a card owned by another user', async () => {
    const creditCardRepository = new InMemoryCreditCardRepository();
    const useCase = new DeleteCreditCardUseCase(creditCardRepository);

    const card = CreditCard.create('user-1', 'Mastercard', 2000, 500);
    await creditCardRepository.create(card);

    const result = await useCase.execute({
      cardId: card.id,
      userId: 'user-2',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Credit card not found');
    expect(await creditCardRepository.findById(card.id)).not.toBeNull();
  });
});