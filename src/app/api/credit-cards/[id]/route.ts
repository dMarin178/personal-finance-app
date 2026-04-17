import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyAccessToken } from '@infrastructure/auth/jwt';
import { DeleteCreditCardUseCase } from '@application/use-cases/delete-credit-card';
import { UpdateCreditCardUseCase } from '@application/use-cases/update-credit-card';
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
      const creditCardRepository = new PrismaCreditCardRepository();
      const creditCard = await creditCardRepository.findById(cardId);

      if (!creditCard || creditCard.userId !== userId) {
        return NextResponse.json(
          { error: 'Credit card not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          card: {
            id: creditCard.id,
            name: creditCard.name,
            creditLimit: creditCard.creditLimit,
            paymentLimit: creditCard.paymentLimit,
            currentBalance: creditCard.currentBalance,
            availableCredit: creditCard.availableCredit,
            lastDigits: creditCard.lastDigits,
            issuer: creditCard.issuer,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Get card error:', error);
      return NextResponse.json(
        { error: 'Failed to get credit card' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'DELETE') {
    try {
      const creditCardRepository = new PrismaCreditCardRepository();
      const deleteCaseUse = new DeleteCreditCardUseCase(creditCardRepository);

      const result = await deleteCaseUse.execute({
        cardId,
        userId,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Credit card deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Delete card error:', error);
      return NextResponse.json(
        { error: 'Failed to delete credit card' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'PUT') {
    try {
      const { name, creditLimit, paymentLimit } = await request.json();
      const parsedCreditLimit = Number(creditLimit);
      const parsedPaymentLimit = Number(paymentLimit);

      if (!name || Number.isNaN(parsedCreditLimit) || Number.isNaN(parsedPaymentLimit)) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const creditCardRepository = new PrismaCreditCardRepository();
      const updateCardUseCase = new UpdateCreditCardUseCase(creditCardRepository);

      const result = await updateCardUseCase.execute({
        cardId,
        userId,
        name,
        creditLimit: parsedCreditLimit,
        paymentLimit: parsedPaymentLimit,
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Credit card updated successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Update card error:', error);
      return NextResponse.json(
        { error: 'Failed to update credit card' },
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

export async function DELETE(
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
