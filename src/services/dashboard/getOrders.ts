import { serverFetch } from '@/lib/serverFetch';
import type { Orders } from '@/types/dashboard.type';
import type { Period, UserType } from '@/types/filters.type';

export const getOrders = async (period: Period, userType: UserType): Promise<Orders | null> => {
  const response = await serverFetch.get(`/orders?period=${period}&userType=${userType}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch orders: ${response.status}`);
  }

  const data: Orders[] = await response.json();
  return data[0] ?? null;
};
