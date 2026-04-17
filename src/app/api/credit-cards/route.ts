import { NextRequest, NextResponse } from 'next/server';
import { GetCreditCardsUseCase } from '@application/use-cases/get-credit-cards';
import { PrismaCreditCardRepository } from '@infrastructure/database/repositories/prisma-credit-card-repository';
import { withAuth } from '@infrastructure/auth/middleware';

async function handler(request: NextRequest, userId: string) {
  try {
    const creditCardRepository = new PrismaCreditCardRepository();
    const getCardsUseCase = new GetCreditCardsUseCase(creditCardRepository);

    const result = await getCardsUseCase.execute({ userId });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { cards: result.cards },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
