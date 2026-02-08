import { serverFetch } from '@/lib/serverFetch';
import type { Traffic } from '@/types/dashboard.type';
import type { Period } from '@/types/filters.type';

export const getTraffic = async (period: Period): Promise<Traffic | null> => {
  const response = await serverFetch.get(`/traffic?period=${period}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch traffic: ${response.status}`);
  }

  const data: Traffic[] = await response.json();
  return data[0] ?? null;
};
