/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole } from "@/lib/auth";
import { serverFetch } from "@/lib/serverFetch";
import { COOKIE_NAME } from "@/lib/token";
import { zodValidator } from "@/lib/zodValidator";
import { Role } from "@/types";
import { loginValidationZodSchema } from "@/zod/auth.validation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    try {
        const redirectTo = formData.get('redirect') || null;

        const payload = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        const validation = zodValidator(payload, loginValidationZodSchema);
        if (!validation.success) {
            return validation;
        }

        const res = await serverFetch.post("/auth/login", {
            body: JSON.stringify(validation.data),
            headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();

        if (!result.success) {
            return { success: false, message: result.message || "Login failed" };
        }

        // Extract access_token from Set-Cookie header and forward to browser
        const setCookieHeaders = res.headers.getSetCookie();
        if (setCookieHeaders?.length) {
            for (const header of setCookieHeaders) {
                if (header.startsWith(`${COOKIE_NAME}=`)) {
                    // Extract token value (substring avoids splitting on '=' inside JWT)
                    const tokenValue = header.substring(
                        COOKIE_NAME.length + 1,
                        header.indexOf(';')
                    );
                    const cookieStore = await cookies();
                    cookieStore.set(COOKIE_NAME, tokenValue, {
                        path: '/',
                        httpOnly: true,
                        maxAge: 60 * 60 * 24 * 7, // 7 days
                        sameSite: 'lax',
                    });
                    break;
                }
            }
        }

        const userRole: Role = result.data.role;

        // Redirect to the requested path if valid for this role
        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(requestedPath);
            }
        }

        // Default: redirect to role's dashboard
        redirect(getDefaultDashboardRoute(userRole));

    } catch (error: any) {
        // Re-throw NEXT_REDIRECT errors so Next.js can handle them
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        return {
            success: false,
            message: process.env.NODE_ENV === 'development'
                ? error.message
                : "Login Failed. You might have entered incorrect email or password.",
        };
    }
}