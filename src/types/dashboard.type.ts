// ─── Dashboard data types ───────────────────────────────────────────────────

export type Trend = 'up' | 'down';

export interface KpiValue {
  value: number;
  previousValue: number;
  changePercent: number;
  trend: Trend;
}

export interface Stats {
  id: string;
  period: string;
  label: string;
  kpis: {
    totalRevenue: KpiValue;
    totalUsers: KpiValue;
    orders: KpiValue;
    conversionRate: KpiValue;
  };
}

export interface RevenueDataPoint {
  label: string;
  revenue: number;
}

export interface Revenue {
  id: string;
  period: string;
  userType: string;
  data: RevenueDataPoint[];
}

export interface OrderDataPoint {
  label: string;
  orders: number;
}

export interface Orders {
  id: string;
  period: string;
  userType: string;
  data: OrderDataPoint[];
}

export interface UserSegment {
  segment: string;
  count: number;
  color: string;
}

export interface UserDistribution {
  id: string;
  period: string;
  distribution: UserSegment[];
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
}

export interface Traffic {
  id: string;
  period: string;
  sources: TrafficSource[];
}
