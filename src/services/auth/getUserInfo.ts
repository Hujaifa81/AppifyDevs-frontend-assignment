import { UserInfo } from '@/types';
import { serverFetch } from '@/lib/serverFetch';
import { COOKIE_NAME, verifyToken } from '@/lib/token';

// If running on the server, prefer reading the cookie via `next/headers`
// to avoid forwarding cookies through fetch. Otherwise fall back to
// calling the internal `/api/auth/me` route from the client.
export const getUserInfo = async (): Promise<UserInfo | null> => {
  try {
    if (typeof window === 'undefined') {
      // Server-side: read cookie directly
      // Use dynamic import to avoid bundling next/headers into client
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { cookies } = require('next/headers');

      // `cookies` can be either a function (cookies()) or an object depending on
      // the Next.js runtime. Handle both shapes gracefully to avoid runtime
      // "get is not a function" errors.
      let token: string | null = null;
      try {
        // `cookies()` may return a Promise in newer Next.js runtimes, so
        // await it to support both sync and async shapes.
        const store = typeof cookies === 'function' ? await cookies() : cookies;
        if (store && typeof store.get === 'function') {
          const found = store.get(COOKIE_NAME);
          token = found?.value ?? null;
        }
      } catch (err) {
        token = null;
      }

      if (!token) return null;

      const payload = await verifyToken(token);
      if (!payload) return null;

      
      const { db } = require('../../app/api/_data');
      const user = db.profiles.find((p: any) => p.id === payload.id);
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      } as UserInfo;
    }

    const response = await serverFetch.get('/auth/me', { credentials: 'include' } as any);

    if (!response.ok) {
      return null; 
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


export const login = async (email: string, password: string) => {
  const response = await serverFetch.post('/auth/login', {
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  });

  return response.json();
};


export const logout = async () => {
  const response = await serverFetch.post('/auth/logout');
  return response.json();
};
