import { UseCase } from './use-case';
import { Expense } from '@domain/entities/expense';
import { ExpenseRepository } from '@domain/repositories/expense-repository';
import { CreditCardRepository } from '@domain/repositories/credit-card-repository';

export interface AddExpenseInput {
  userId: string;
  creditCardId?: string;
  description: string;
  amount: number;
  category: string;
  date?: Date;
}

export interface AddExpenseOutput {
  success: boolean;
  expenseId?: string;
  error?: string;
}

export class AddExpenseUseCase extends UseCase<AddExpenseInput, AddExpenseOutput> {
  constructor(
    private expenseRepository: ExpenseRepository,
    private creditCardRepository: CreditCardRepository
  ) {
    super();
  }

  async execute(input: AddExpenseInput): Promise<AddExpenseOutput> {
    try {
      // Validate inputs
      if (input.amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0',
        };
      }

      const creditCard = input.creditCardId
        ? await this.creditCardRepository.findById(input.creditCardId)
        : null;

      if (input.creditCardId && !creditCard) {
        return {
          success: false,
          error: 'Credit card not found',
        };
      }

      if (creditCard && creditCard.currentBalance + input.amount > creditCard.creditLimit) {
        return {
          success: false,
          error: 'Expense would exceed credit limit',
        };
      }

      const expense = Expense.create(
        input.userId,
        input.description,
        input.amount,
        input.category,
        input.creditCardId,
        input.date
      );

      await this.expenseRepository.create(expense);

      // Keep balance and expense in sync: if card update fails, rollback created expense.
      if (creditCard) {
        try {
          creditCard.addExpense(input.amount);
          await this.creditCardRepository.update(creditCard);
        } catch {
          await this.expenseRepository.delete(expense.id);

          return {
            success: false,
            error: 'Failed to add expense',
          };
        }
      }

      return {
        success: true,
        expenseId: expense.id,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add expense',
      };
    }
  }
}
