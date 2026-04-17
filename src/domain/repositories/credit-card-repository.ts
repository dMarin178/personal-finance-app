import { CreditCard } from '../entities/credit-card';

export interface CreditCardRepository {
  create(creditCard: CreditCard): Promise<void>;
  findById(id: string): Promise<CreditCard | null>;
  findByUserId(userId: string): Promise<CreditCard[]>;
  update(creditCard: CreditCard): Promise<void>;
  delete(id: string): Promise<void>;
}
