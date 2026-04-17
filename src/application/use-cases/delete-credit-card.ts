import { UseCase } from './use-case';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface DeleteCreditCardInput {
  cardId: string;
  userId: string;
}

export interface DeleteCreditCardOutput {
  success: boolean;
  error?: string;
}

export class DeleteCreditCardUseCase extends UseCase<
  DeleteCreditCardInput,
  DeleteCreditCardOutput
> {
  constructor(private creditCardRepository: CreditCardRepository) {
    super();
  }

  async execute(input: DeleteCreditCardInput): Promise<DeleteCreditCardOutput> {
    try {
      // Verify that the card belongs to the user
      const creditCard = await this.creditCardRepository.findById(input.cardId);
      if (!creditCard || creditCard.userId !== input.userId) {
        return {
          success: false,
          error: 'Credit card not found',
        };
      }

      await this.creditCardRepository.delete(input.cardId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete credit card',
      };
    }
  }
}
