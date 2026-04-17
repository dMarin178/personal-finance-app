import { UseCase } from './use-case';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface UpdateCreditCardInput {
  cardId: string;
  userId: string;
  name: string;
  creditLimit: number;
  paymentLimit: number;
}

export interface UpdateCreditCardOutput {
  success: boolean;
  error?: string;
}

export class UpdateCreditCardUseCase extends UseCase<
  UpdateCreditCardInput,
  UpdateCreditCardOutput
> {
  constructor(private creditCardRepository: CreditCardRepository) {
    super();
  }

  async execute(input: UpdateCreditCardInput): Promise<UpdateCreditCardOutput> {
    try {
      const card = await this.creditCardRepository.findById(input.cardId);

      if (!card || card.userId !== input.userId) {
        return {
          success: false,
          error: 'Credit card not found',
        };
      }

      if (input.creditLimit <= 0) {
        return {
          success: false,
          error: 'Credit limit must be greater than 0',
        };
      }

      if (input.paymentLimit <= 0) {
        return {
          success: false,
          error: 'Payment limit must be greater than 0',
        };
      }

      if (input.paymentLimit > input.creditLimit) {
        return {
          success: false,
          error: 'Payment limit cannot exceed credit limit',
        };
      }

      if (card.currentBalance > input.creditLimit) {
        return {
          success: false,
          error: 'Credit limit cannot be lower than current balance',
        };
      }

      card.name = input.name;
      card.creditLimit = input.creditLimit;
      card.paymentLimit = input.paymentLimit;
      card.updatedAt = new Date();

      await this.creditCardRepository.update(card);

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error: 'Failed to update credit card',
      };
    }
  }
}
