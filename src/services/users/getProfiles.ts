import { serverFetch } from '@/lib/serverFetch';
import type { UserInfo } from '@/types';

export const getProfiles = async (role?: string): Promise<UserInfo[]> => {
  const roleQuery = role ? `?role=${encodeURIComponent(role)}` : '';
  const res = await serverFetch.get(`/profiles${roleQuery}`);
  if (!res.ok) throw new Error(`Failed to fetch profiles: ${res.status}`);
  const data: UserInfo[] = await res.json();
  return data;
};
