import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner } from './lib/auth';
import { COOKIE_NAME, verifyToken } from './lib/token';
import { Role } from '@/types';


const PUBLIC_ROUTES = ['/login'];

async function getRoleFromToken(request: NextRequest): Promise<Role | null> {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    return payload?.role ?? null;
}


export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const userRole = await getRoleFromToken(request);
    const routeOwner = getRouteOwner(pathname);
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (isPublicRoute && userRole) {
        return NextResponse.redirect(
            new URL(getDefaultDashboardRoute(userRole), request.url)
        );
    }

    if (routeOwner === null) {
        return NextResponse.next();
    }

    if (!userRole) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (routeOwner === 'COMMON') {
        return NextResponse.next();
    }

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
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
}