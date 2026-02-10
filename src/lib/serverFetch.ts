import { API_BASE_URL } from "@/lib/constants";

// When running server-side (Next.js server actions / server components),
// prefer calling the internal Next API routes so we don't accidentally
// forward auth requests to the external JSON Server used in dev.
const BACKEND_API_URL = typeof window === 'undefined' ? '/api' : API_BASE_URL;

// /auth/login
const serverFetchHelper = async (endpoint: string, options: RequestInit): Promise<Response> => {
    const { headers, ...restOptions } = options;
    


    const isClient = typeof window !== 'undefined';
    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
        headers: {
            ...headers,
        },
        // Prevent browser from returning 304 Not Modified by forcing fresh fetches
        // for client-side requests. Server-side calls can use default cache.
        ...(isClient ? { cache: 'no-store' as RequestCache } : {}),
        ...restOptions,
    })

    return response;
}

export const serverFetch = {
    get: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "GET" }),

    post: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "POST" }),

    put: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PUT" }),

    patch: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "PATCH" }),

    delete: async (endpoint: string, options: RequestInit = {}): Promise<Response> => serverFetchHelper(endpoint, { ...options, method: "DELETE" }),

}

/**
 * 
 * serverFetch.get("/auth/me")
 * serverFetch.post("/auth/login", { body: JSON.stringify({}) })
 */