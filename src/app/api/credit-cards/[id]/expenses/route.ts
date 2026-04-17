import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from '@infrastructure/auth/jwt';
import { GetExpensesByCardUseCase } from '@application/use-cases/get-expenses-by-card';
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
  const cardId = params.id;

  if (request.method === 'GET') {
    try {
      // Verify the credit card belongs to the user
      const creditCardRepository = new PrismaCreditCardRepository();
      const creditCard = await creditCardRepository.findById(cardId);

      if (!creditCard || creditCard.userId !== userId) {
        return NextResponse.json(
          { error: 'Credit card not found' },
          { status: 404 }
        );
      }

      const expenseRepository = new PrismaExpenseRepository();
      const getExpensesUseCase = new GetExpensesByCardUseCase(expenseRepository);

      const result = await getExpensesUseCase.execute({
        creditCardId: cardId,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          expenses: result.expenses,
          totalAmount: result.totalAmount,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Get expenses error:', error);
      return NextResponse.json(
        { error: 'Failed to get expenses' },
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
