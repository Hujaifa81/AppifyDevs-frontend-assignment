import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner } from './lib/auth';
import { COOKIE_NAME, verifyToken } from './lib/token';
import { Role } from '@/types';


// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

/**
 * Read role from the access_token cookie.
 * Verifies the JWT and extracts the role.
 * Returns null if not authenticated or token is expired.
 */
async function getRoleFromToken(request: NextRequest): Promise<Role | null> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload?.role ?? null;
}


export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const userRole = await getRoleFromToken(request);
    const routeOwner = getRouteOwner(pathname);
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Rule 1: Logged-in user trying to access login/register → redirect to dashboard
    if (isPublicRoute && userRole) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole), request.url)
        );
    }

    // Rule 2: Public routes → allow through
    if (routeOwner === null) {
        return NextResponse.next();
    }

    // Rule 3: Protected route but not authenticated → redirect to login
    if (!userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 4: Common protected routes → allow any authenticated role
    if (routeOwner === 'COMMON') {
        return NextResponse.next();
    }

    // Rule 5: Role-based routes → redirect if role doesn't match
    if (routeOwner === 'ADMIN' || routeOwner === 'MANAGER') {
        if (userRole !== routeOwner) {
            return NextResponse.redirect(
                new URL(getDefaultDashboardRoute(userRole), request.url)
            );
        }
    }

    return NextResponse.next();
}


export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
}