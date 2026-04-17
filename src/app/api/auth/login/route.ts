import { NextRequest, NextResponse } from 'next/server';
import { LoginUserUseCase } from '@application/use-cases/login-user';
import { PrismaUserRepository } from '@infrastructure/database/repositories/prisma-user-repository';
import { generateTokens } from '@infrastructure/auth/jwt';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userRepository = new PrismaUserRepository();
    const loginUseCase = new LoginUserUseCase(userRepository);

    const result = await loginUseCase.execute({
      email,
      password,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: result.userId!,
      email: result.email!,
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        accessToken,
        user: {
          id: result.userId,
          email: result.email,
          name: result.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
