import { serverFetch } from '@/lib/serverFetch';
import type { UserDistribution } from '@/types/dashboard.type';
import type { Period } from '@/types/filters.type';

export const getUsers = async (period: Period): Promise<UserDistribution | null> => {
  const response = await serverFetch.get(`/users?period=${period}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const data: UserDistribution[] = await response.json();
  return data[0] ?? null;
};
