import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@infrastructure/auth/middleware';
import prisma from '@infrastructure/database/prisma-client';

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handler(request: NextRequest, userId: string) {
  try {
    const { creditCardId, description, amount, category, date } = await request.json();
    const parsedAmount = Number(amount);
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    const expenseDate = date ? new Date(date) : new Date();

    if (!normalizedDescription || !category || Number.isNaN(parsedAmount)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (Number.isNaN(expenseDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    const expense = await prisma.$transaction(async (tx) => {
      if (creditCardId) {
        const creditCard = await tx.creditCard.findUnique({
          where: { id: creditCardId },
        });

        if (!creditCard || creditCard.userId !== userId) {
          throw new HttpError(404, 'Credit card not found');
        }

        if (creditCard.currentBalance + parsedAmount > creditCard.creditLimit) {
          throw new HttpError(400, 'Expense would exceed credit limit');
        }

        const createdExpense = await tx.expense.create({
          data: {
            userId,
            creditCardId,
            description: normalizedDescription,
            amount: parsedAmount,
            category,
            date: expenseDate,
          },
        });

        await tx.creditCard.update({
          where: { id: creditCardId },
          data: {
            currentBalance: {
              increment: parsedAmount,
            },
          },
        });

        return createdExpense;
      }

      return tx.expense.create({
        data: {
          userId,
          description: normalizedDescription,
          amount: parsedAmount,
          category,
          date: expenseDate,
        },
      });
    });

    return NextResponse.json(
      { message: 'Expense added successfully', expenseId: expense.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Add expense error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
