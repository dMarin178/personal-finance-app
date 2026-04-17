import { UseCase } from './use-case';
import { ExpenseRepository } from '@domain/repositories/expense-repository';

export interface GetExpensesByCardInput {
  creditCardId: string;
}

export interface ExpenseDetail {
  id: string;
  creditCardId?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface GetExpensesByCardOutput {
  success: boolean;
  expenses?: ExpenseDetail[];
  totalAmount?: number;
  error?: string;
}

export class GetExpensesByCardUseCase extends UseCase<
  GetExpensesByCardInput,
  GetExpensesByCardOutput
> {
  constructor(private expenseRepository: ExpenseRepository) {
    super();
  }

  async execute(input: GetExpensesByCardInput): Promise<GetExpensesByCardOutput> {
    try {
      const expenses = await this.expenseRepository.findByCardId(input.creditCardId);

      const expenseDetails = expenses.map((expense) => ({
        id: expense.id,
        creditCardId: expense.creditCardId,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString(),
      }));

      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      return {
        success: true,
        expenses: expenseDetails,
        totalAmount,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get expenses',
      };
    }
  }
}
