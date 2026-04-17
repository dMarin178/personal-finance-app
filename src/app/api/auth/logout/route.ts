import { NextResponse } from 'next/server';

const REFRESH_COOKIE_NAME = 'refreshToken';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );

  response.cookies.set({
    name: REFRESH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });

  return response;
}
