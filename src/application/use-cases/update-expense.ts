import { UseCase } from './use-case';
import { ExpenseRepository } from '@domain/repositories/expense-repository';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface UpdateExpenseInput {
  expenseId: string;
  description?: string;
  amount?: number;
  category?: string;
  date?: Date;
}

export interface UpdateExpenseOutput {
  success: boolean;
  error?: string;
}

export class UpdateExpenseUseCase extends UseCase<UpdateExpenseInput, UpdateExpenseOutput> {
  constructor(
    private expenseRepository: ExpenseRepository,
    private creditCardRepository: CreditCardRepository
  ) {
    super();
  }

  async execute(input: UpdateExpenseInput): Promise<UpdateExpenseOutput> {
    try {
      const expense = await this.expenseRepository.findById(input.expenseId);
      if (!expense) {
        return {
          success: false,
          error: 'Expense not found',
        };
      }

      if (input.amount !== undefined && input.amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0',
        };
      }

      // If amount is being changed and expense belongs to a card, update card balance as well.
      if (input.amount !== undefined && input.amount !== expense.amount && expense.creditCardId) {
        const creditCard = await this.creditCardRepository.findById(expense.creditCardId);
        if (!creditCard) {
          return {
            success: false,
            error: 'Credit card not found',
          };
        }

        const amountDifference = input.amount - expense.amount;

        // Check if new total would exceed credit limit
        if (creditCard.currentBalance + amountDifference > creditCard.creditLimit) {
          return {
            success: false,
            error: 'Updated expense would exceed credit limit',
          };
        }

        creditCard.currentBalance += amountDifference;
        creditCard.updatedAt = new Date();
        await this.creditCardRepository.update(creditCard);
      }

      // Update expense fields
      if (input.description !== undefined) {
        expense.description = input.description;
      }
      if (input.amount !== undefined) {
        expense.amount = input.amount;
      }
      if (input.category !== undefined) {
        expense.category = input.category;
      }
      if (input.date !== undefined) {
        expense.date = input.date;
      }

      await this.expenseRepository.update(expense);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update expense',
      };
    }
  }
}
