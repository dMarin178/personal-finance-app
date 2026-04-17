import { NextRequest, NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@application/use-cases/register-user';
import { PrismaUserRepository } from '@infrastructure/database/repositories/prisma-user-repository';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userRepository = new PrismaUserRepository();
    const registerUseCase = new RegisterUserUseCase(userRepository);

    const result = await registerUseCase.execute({
      email,
      password,
      name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'User registered successfully', userId: result.userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
