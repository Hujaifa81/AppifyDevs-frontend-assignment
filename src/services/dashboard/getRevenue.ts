import { serverFetch } from '@/lib/serverFetch';
import type { Revenue } from '@/types/dashboard.type';
import type { Period, UserType } from '@/types/filters.type';

export const getRevenue = async (period: Period, userType: UserType): Promise<Revenue | null> => {
  const response = await serverFetch.get(`/revenue?period=${period}&userType=${userType}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch revenue: ${response.status}`);
  }

  const data: Revenue[] = await response.json();
  return data[0] ?? null;
};
