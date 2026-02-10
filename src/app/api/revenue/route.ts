import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_data';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period');
  const userTypeParam = request.nextUrl.searchParams.get('userType') || '';
  const userType = userTypeParam.trim().toLowerCase();

  let results = db.revenue;
  if (period) {
    results = results.filter((r) => r.period === period);
  }
  if (userType && userType !== 'all') {
    results = results.filter((r) => String(r.userType).toLowerCase() === userType);
  }

  return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
}
