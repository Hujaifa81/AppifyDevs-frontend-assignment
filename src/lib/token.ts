import { SignJWT, jwtVerify } from 'jose';
import { Role } from '@/types';

// ─── JWT token utilities (using jose — works in Edge + Node.js) ─────────────

export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const COOKIE_NAME = 'access_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Secret key for signing JWTs (in production, use a strong env variable)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'appifydevs-dashboard-secret-key-2026'
);

/**
 * Sign a JWT with user data as payload.
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT and extract the payload.
 * Returns null if token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.id && payload.role) {
      return {
        id: payload.id as string,
        name: payload.name as string,
        email: payload.email as string,
        role: payload.role as Role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build Set-Cookie header string for the access token.
 */
export function buildCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Build Set-Cookie header string to clear the access token.
 */
export function buildClearCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
}
