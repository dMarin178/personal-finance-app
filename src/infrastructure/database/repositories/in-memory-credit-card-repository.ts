import { CreditCard } from '@domain/entities/credit-card';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';
import { getDatabase } from '../connection';

export class InMemoryCreditCardRepository implements CreditCardRepository {
  async create(creditCard: CreditCard): Promise<void> {
    const db = getDatabase();
    db.creditCards.set(creditCard.id, creditCard);
  }

  async findById(id: string): Promise<CreditCard | null> {
    const db = getDatabase();
    return db.creditCards.get(id) || null;
  }

  async findByUserId(userId: string): Promise<CreditCard[]> {
    const db = getDatabase();
    const cards: CreditCard[] = [];
    for (const card of db.creditCards.values()) {
      if (card.userId === userId) {
        cards.push(card);
      }
    }
    return cards;
  }

  async update(creditCard: CreditCard): Promise<void> {
    const db = getDatabase();
    db.creditCards.set(creditCard.id, creditCard);
  }

  async delete(id: string): Promise<void> {
    const db = getDatabase();
    db.creditCards.delete(id);
  }
}
