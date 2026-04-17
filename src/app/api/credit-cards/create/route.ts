import { NextRequest, NextResponse } from 'next/server';
import { CreateCreditCardUseCase } from '@application/use-cases/create-credit-card';
import { PrismaCreditCardRepository } from '@infrastructure/database/repositories/prisma-credit-card-repository';
import { withAuth } from '@infrastructure/auth/middleware';

async function handler(request: NextRequest, userId: string) {
  try {
    const { name, creditLimit, paymentLimit } = await request.json();

    if (!name || !creditLimit || !paymentLimit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const creditCardRepository = new PrismaCreditCardRepository();
    const createCardUseCase = new CreateCreditCardUseCase(creditCardRepository);

    const result = await createCardUseCase.execute({
      userId,
      name,
      creditLimit,
      paymentLimit,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Credit card created successfully', cardId: result.cardId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
