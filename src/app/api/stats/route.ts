import { NextRequest, NextResponse } from 'next/server';
import { db } from '../_data';

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get('period');
  const userTypeParam = request.nextUrl.searchParams.get('userType') || '';
  const userType = userTypeParam.trim().toLowerCase();

  

  const base = db.stats.find((s) => s.period === period) ?? null;

  if (!userType || userType === 'all') {
    return NextResponse.json(base ? [base] : [], { headers: { 'Cache-Control': 'no-store' } });
  }

  const revenueEntries = db.revenue.filter((r: any) => r.period === period && String(r.userType).toLowerCase() === userType);
  const ordersEntries = db.orders.filter((o: any) => o.period === period && String(o.userType).toLowerCase() === userType);
  const usersEntry = db.users.find((u: any) => u.period === period);

  const totalRevenue = revenueEntries.reduce((sum: number, e: any) => {
    return (
      sum + (Array.isArray(e.data) ? e.data.reduce((s: number, d: any) => s + (d.revenue || 0), 0) : 0)
    );
  }, 0);

  const totalOrders = ordersEntries.reduce((sum: number, e: any) => {
    return (
      sum + (Array.isArray(e.data) ? e.data.reduce((s: number, d: any) => s + (d.orders || 0), 0) : 0)
    );
  }, 0);

  const segmentLabel = userType === 'free' ? 'Free' : userType === 'premium' ? 'Premium' : userType === 'enterprise' ? 'Enterprise' : null;
  let totalUsers = 0;
  if (segmentLabel && usersEntry && Array.isArray(usersEntry.distribution)) {
    const seg = usersEntry.distribution.find((d: any) => d.segment === segmentLabel);
    totalUsers = seg?.count ?? 0;
  }

  const kpis = {
    totalRevenue: {
      value: totalRevenue,
      previousValue: base?.kpis?.totalRevenue?.previousValue ?? 0,
      changePercent: base?.kpis?.totalRevenue?.previousValue ? Math.round(((totalRevenue - base.kpis.totalRevenue.previousValue) / base.kpis.totalRevenue.previousValue) * 10) / 10 : 0,
      trend: totalRevenue >= (base?.kpis?.totalRevenue?.previousValue ?? 0) ? 'up' : 'down',
    },
    totalUsers: {
      value: totalUsers,
      previousValue: base?.kpis?.totalUsers?.previousValue ?? 0,
      changePercent: base?.kpis?.totalUsers?.previousValue ? Math.round(((totalUsers - base.kpis.totalUsers.previousValue) / base.kpis.totalUsers.previousValue) * 10) / 10 : 0,
      trend: totalUsers >= (base?.kpis?.totalUsers?.previousValue ?? 0) ? 'up' : 'down',
    },
    orders: {
      value: totalOrders,
      previousValue: base?.kpis?.orders?.previousValue ?? 0,
      changePercent: base?.kpis?.orders?.previousValue ? Math.round(((totalOrders - base.kpis.orders.previousValue) / base.kpis.orders.previousValue) * 10) / 10 : 0,
      trend: totalOrders >= (base?.kpis?.orders?.previousValue ?? 0) ? 'up' : 'down',
    },
    conversionRate: base?.kpis?.conversionRate ?? { value: 0, previousValue: 0, changePercent: 0, trend: 'up' },
  };

  const result = {
    id: base?.id ?? `${period}-${userType}`,
    period: period,
    label: base?.label ?? `Filtered ${period}`,
    kpis,
  };

  return NextResponse.json([result], { headers: { 'Cache-Control': 'no-store' } });
}
