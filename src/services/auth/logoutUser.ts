"use server"

import { serverFetch } from "@/lib/serverFetch";
import { COOKIE_NAME } from "@/lib/token";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export const logoutUser = async () => {
    try {
        await serverFetch.post("/auth/logout");

        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME);

        redirect("/login");
    } catch (error: unknown) {
        if (error instanceof Error && 'digest' in error && (error as { digest: string }).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        const cookieStore = await cookies();
        cookieStore.delete(COOKIE_NAME);

        redirect("/login");
    }
}
