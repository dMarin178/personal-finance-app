import { UseCase } from './use-case';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface GetCreditCardsInput {
  userId: string;
}

export interface GetCreditCardsOutput {
  success: boolean;
  cards?: Array<{
    id: string;
    name: string;
    creditLimit: number;
    paymentLimit: number;
    currentBalance: number;
    availableCredit: number;
    lastDigits?: string;
    issuer?: string;
  }>;
  error?: string;
}

export class GetCreditCardsUseCase extends UseCase<
  GetCreditCardsInput,
  GetCreditCardsOutput
> {
  constructor(private creditCardRepository: CreditCardRepository) {
    super();
  }

  async execute(input: GetCreditCardsInput): Promise<GetCreditCardsOutput> {
    try {
      const cards = await this.creditCardRepository.findByUserId(input.userId);

      return {
        success: true,
        cards: cards.map((card) => ({
          id: card.id,
          name: card.name,
          creditLimit: card.creditLimit,
          paymentLimit: card.paymentLimit,
          currentBalance: card.currentBalance,
          availableCredit: card.availableCredit,
          lastDigits: card.lastDigits,
          issuer: card.issuer,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get credit cards',
      };
    }
  }
}
