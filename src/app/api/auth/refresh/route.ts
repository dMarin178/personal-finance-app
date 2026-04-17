import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@infrastructure/auth/jwt';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function clearRefreshCookie(response: NextResponse) {
  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

    if (!refreshToken) {
      const response = NextResponse.json(
        { error: 'Missing refresh token' },
        { status: 400 }
      );
      clearRefreshCookie(response);
      return response;
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      const response = NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
      clearRefreshCookie(response);
      return response;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: payload.userId,
      email: payload.email,
    });

    const response = NextResponse.json(
      {
        accessToken,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: newRefreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
