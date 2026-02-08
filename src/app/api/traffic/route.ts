import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_data';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period');

  let results = db.traffic;
  if (period) {
    results = results.filter((t) => t.period === period);
  }

  return NextResponse.json(results);
}
