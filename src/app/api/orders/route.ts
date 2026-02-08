import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_data';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period');
  const userType = request.nextUrl.searchParams.get('userType');

  let results = db.orders;
  if (period) {
    results = results.filter((o) => o.period === period);
  }
  if (userType) {
    results = results.filter((o) => o.userType === userType);
  }

  return NextResponse.json(results);
}
