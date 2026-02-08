import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_data';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period');
  const userType = request.nextUrl.searchParams.get('userType');

  let results = db.revenue;
  if (period) {
    results = results.filter((r) => r.period === period);
  }
  if (userType) {
    results = results.filter((r) => r.userType === userType);
  }

  return NextResponse.json(results);
}
