import { serverFetch } from '@/lib/serverFetch';
import type { Stats } from '@/types/dashboard.type';
import type { Period } from '@/types/filters.type';

export const getStats = async (period: Period): Promise<Stats | null> => {
  const response = await serverFetch.get(`/stats?period=${period}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`);
  }

  const data: Stats[] = await response.json();
  return data[0] ?? null;
};
