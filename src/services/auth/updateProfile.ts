import { serverFetch } from '@/lib/serverFetch';
import { UserInfo } from '@/types';

export const updateProfile = async (data: FormData | { name?: string; contactNumber?: string; avatar?: string; }): Promise<{ success: boolean; data?: UserInfo; message?: string }> => {
  if (data instanceof FormData) {
    const res = await serverFetch.post('/profiles/update', {
      body: data,
    });
    return res.json();
  }

  const res = await serverFetch.post('/profiles/update', {
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  return res.json();
};
