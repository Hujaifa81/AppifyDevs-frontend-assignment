import { UserInfo } from '@/types';
import { serverFetch } from '@/lib/serverFetch';

// ─── Fetch current user info from /auth/me ──────────────────────────────────
// The API reads the access_token cookie automatically and returns user data.

export const getUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const response = await serverFetch.get('/auth/me');

    if (!response.ok) {
      return null; // Not authenticated
    }

    const result = await response.json();

    if (result.success && result.data) {
      return result.data as UserInfo;
    }

    return null;
  } catch (error) {
    console.error('getUserInfo error:', error);
    return null;
  }
};

// ─── Login ──────────────────────────────────────────────────────────────────

export const login = async (email: string, password: string) => {
  const response = await serverFetch.post('/auth/login', {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  });

  return response.json();
};

// ─── Logout ─────────────────────────────────────────────────────────────────

export const logout = async () => {
  const response = await serverFetch.post('/auth/logout');
  return response.json();
};
