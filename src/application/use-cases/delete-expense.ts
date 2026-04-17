import { UseCase } from './use-case';
import { ExpenseRepository } from '@domain/repositories/expense-repository';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface DeleteExpenseInput {
  expenseId: string;
}

export interface DeleteExpenseOutput {
  success: boolean;
  error?: string;
}

export class DeleteExpenseUseCase extends UseCase<DeleteExpenseInput, DeleteExpenseOutput> {
  constructor(
    private expenseRepository: ExpenseRepository,
    private creditCardRepository: CreditCardRepository
  ) {
    super();
  }

  async execute(input: DeleteExpenseInput): Promise<DeleteExpenseOutput> {
    try {
      // Get the expense to find the card it belongs to
      const expense = await this.expenseRepository.findById(input.expenseId);
      if (!expense) {
        return {
          success: false,
          error: 'Expense not found',
        };
      }

      // If expense belongs to a credit card, revert its balance.
      if (expense.creditCardId) {
        const creditCard = await this.creditCardRepository.findById(expense.creditCardId);
        if (creditCard) {
          creditCard.currentBalance -= expense.amount;
          creditCard.updatedAt = new Date();
          await this.creditCardRepository.update(creditCard);
        }
      }

      // Delete the expense
      await this.expenseRepository.delete(input.expenseId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete expense',
      };
    }
  }
}
