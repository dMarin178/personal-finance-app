import { CreditCard } from '@domain/entities/credit-card';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';
import prisma from '../prisma-client';

export class PrismaCreditCardRepository implements CreditCardRepository {
  async create(creditCard: CreditCard): Promise<void> {
    await prisma.creditCard.create({
      data: {
        id: creditCard.id,
        userId: creditCard.userId,
        name: creditCard.name,
        creditLimit: creditCard.creditLimit,
        paymentLimit: creditCard.paymentLimit,
        currentBalance: creditCard.currentBalance,
        lastDigits: creditCard.lastDigits,
        issuer: creditCard.issuer,
        createdAt: creditCard.createdAt,
        updatedAt: creditCard.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<CreditCard | null> {
    const dbCard = await prisma.creditCard.findUnique({
      where: { id },
    });

    if (!dbCard) return null;

    return new CreditCard(
      dbCard.id,
      dbCard.userId,
      dbCard.name,
      dbCard.creditLimit,
      dbCard.paymentLimit,
      dbCard.currentBalance,
      dbCard.createdAt,
      dbCard.updatedAt,
      dbCard.lastDigits ?? undefined,
      dbCard.issuer ?? undefined
    );
  }

  async findByUserId(userId: string): Promise<CreditCard[]> {
    const dbCards = await prisma.creditCard.findMany({
      where: { userId },
    });

    return dbCards.map(
      (card) =>
        new CreditCard(
          card.id,
          card.userId,
          card.name,
          card.creditLimit,
          card.paymentLimit,
          card.currentBalance,
          card.createdAt,
          card.updatedAt,
          card.lastDigits ?? undefined,
          card.issuer ?? undefined
        )
    );
  }

  async update(creditCard: CreditCard): Promise<void> {
    await prisma.creditCard.update({
      where: { id: creditCard.id },
      data: {
        name: creditCard.name,
        creditLimit: creditCard.creditLimit,
        paymentLimit: creditCard.paymentLimit,
        currentBalance: creditCard.currentBalance,
        lastDigits: creditCard.lastDigits,
        issuer: creditCard.issuer,
        updatedAt: creditCard.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.creditCard.delete({
      where: { id },
    });
  }
}
