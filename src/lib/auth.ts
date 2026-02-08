import { Role } from "@/types";

export type RouteConfig = {
    exact: string[],
    patterns: RegExp[],
}

export const commonProtectedRoutes: RouteConfig = {
    exact: ["/"],
    patterns: [],
}

export const managerProtectedRoutes: RouteConfig = {
    patterns: [/^\/manager/],
    exact: [],
}

export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/admin/],
    exact: [],
}


export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.patterns.some((pattern: RegExp) => pattern.test(pathname))
}

export const getRouteOwner = (pathname: string): "ADMIN" | "MANAGER" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }
    if (isRouteMatches(pathname, managerProtectedRoutes)) {
        return "MANAGER";
    }
    if (isRouteMatches(pathname, commonProtectedRoutes)) {
        return "COMMON";
    }
    return null;
}

export const getDefaultDashboardRoute = (role: Role): string => {
    if (role === "ADMIN") {
        return "/admin/dashboard";
    }
    if (role === "MANAGER") {
        return "/manager/dashboard";
    }
    return "/";
}

export const isValidRedirectForRole = (redirectPath: string, role: Role): boolean => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    return false;
}