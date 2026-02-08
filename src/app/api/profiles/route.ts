import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_data';

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role');

  let results = db.profiles;
  if (role) {
    results = results.filter((p) => p.role === role.toUpperCase());
  }

  return NextResponse.json(results);
}
