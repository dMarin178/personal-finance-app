import { UseCase } from './use-case';
import { CreditCard } from '@domain/entities/credit-card';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface CreateCreditCardInput {
  userId: string;
  name: string;
  creditLimit: number;
  paymentLimit: number;
}

export interface CreateCreditCardOutput {
  success: boolean;
  cardId?: string;
  error?: string;
}

export class CreateCreditCardUseCase extends UseCase<
  CreateCreditCardInput,
  CreateCreditCardOutput
> {
  constructor(private creditCardRepository: CreditCardRepository) {
    super();
  }

  async execute(input: CreateCreditCardInput): Promise<CreateCreditCardOutput> {
    try {
      // Validate inputs
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

      // Create credit card
      const creditCard = CreditCard.create(
        input.userId,
        input.name,
        input.creditLimit,
        input.paymentLimit
      );

      await this.creditCardRepository.create(creditCard);

      return {
        success: true,
        cardId: creditCard.id,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create credit card',
      };
    }
  }
}
