"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole } from "@/lib/auth";
import { signToken } from '@/lib/token';
import { COOKIE_NAME } from "@/lib/token";
import { zodValidator } from "@/lib/zodValidator";
import { Role } from "@/types";
import { loginValidationZodSchema } from "@/zod/auth.validation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export const loginUser = async (formData: FormData): Promise<any> => {
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

        
        const { db } = require('../../app/api/_data');

        const user = db.profiles.find((p: any) => p.email === validation.data.email && p.password === validation.data.password);
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        const token = await signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            sameSite: 'lax',
        });

        const userRole: Role = user.role;

        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(requestedPath);
            }
        }

        redirect(getDefaultDashboardRoute(userRole));

    } catch (error: any) {
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