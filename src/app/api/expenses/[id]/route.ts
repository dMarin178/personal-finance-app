import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from '@infrastructure/auth/jwt';
import { DeleteExpenseUseCase } from '@application/use-cases/delete-expense';
import { UpdateExpenseUseCase } from '@application/use-cases/update-expense';
import { PrismaExpenseRepository } from '@infrastructure/database/repositories/prisma-expense-repository';
import { PrismaCreditCardRepository } from '@infrastructure/database/repositories/prisma-credit-card-repository';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = extractTokenFromHeader(request.headers.get('authorization') || undefined);
  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const userId = payload.userId;
  const expenseId = params.id;

  if (request.method === 'GET') {
    try {
      const expenseRepository = new PrismaExpenseRepository();
      const creditCardRepository = new PrismaCreditCardRepository();
      const expense = await expenseRepository.findById(expenseId);

      if (!expense) {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        );
      }

      let hasCardOwnership = false;

      if (expense.creditCardId) {
        const creditCard = await creditCardRepository.findById(expense.creditCardId);
        hasCardOwnership = Boolean(creditCard && creditCard.userId === userId);
      }

      const hasExpenseOwnership = expense.userId === userId;

      if (!hasExpenseOwnership && !hasCardOwnership) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          expense: {
            id: expense.id,
            creditCardId: expense.creditCardId,
            userId: expense.userId,
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date.toISOString(),
            createdAt: expense.createdAt.toISOString(),
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Get expense error:', error);
      return NextResponse.json(
        { error: 'Failed to get expense' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'PUT') {
    try {
      const { description, amount, category, date } = await request.json();

      const expenseRepository = new PrismaExpenseRepository();
      const creditCardRepository = new PrismaCreditCardRepository();
      const updateExpenseUseCase = new UpdateExpenseUseCase(
        expenseRepository,
        creditCardRepository
      );

      // Verify ownership
      const expense = await expenseRepository.findById(expenseId);
      if (!expense) {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        );
      }

      let hasCardOwnership = false;
      if (expense.creditCardId) {
        const creditCard = await creditCardRepository.findById(expense.creditCardId);
        hasCardOwnership = Boolean(creditCard && creditCard.userId === userId);
      }

      const hasExpenseOwnership = expense.userId === userId;
      if (!hasExpenseOwnership && !hasCardOwnership) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      const parsedAmount = amount !== undefined ? Number(amount) : undefined;
      if (parsedAmount !== undefined && Number.isNaN(parsedAmount)) {
        return NextResponse.json(
          { error: 'Amount must be a valid number' },
          { status: 400 }
        );
      }

      const result = await updateExpenseUseCase.execute({
        expenseId,
        description,
        amount: parsedAmount,
        category,
        date: date ? new Date(date) : undefined,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Expense updated successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Update expense error:', error);
      return NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'DELETE') {
    try {
      // Verify ownership
      const expenseRepository = new PrismaExpenseRepository();
      const expense = await expenseRepository.findById(expenseId);
      if (!expense) {
        return NextResponse.json(
          { error: 'Expense not found' },
          { status: 404 }
        );
      }

      const creditCardRepository = new PrismaCreditCardRepository();
      let hasCardOwnership = false;
      if (expense.creditCardId) {
        const creditCard = await creditCardRepository.findById(expense.creditCardId);
        hasCardOwnership = Boolean(creditCard && creditCard.userId === userId);
      }

      const hasExpenseOwnership = expense.userId === userId;
      if (!hasExpenseOwnership && !hasCardOwnership) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      const deleteExpenseUseCase = new DeleteExpenseUseCase(
        expenseRepository,
        creditCardRepository
      );

      const result = await deleteExpenseUseCase.execute({
        expenseId,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Expense deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Delete expense error:', error);
      return NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handler(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handler(request, { params });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handler(request, { params });
}
