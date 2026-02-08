import { NextResponse } from 'next/server';
import { buildClearCookieHeader } from '@/lib/token';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.headers.set('Set-Cookie', buildClearCookieHeader());

  return response;
}
