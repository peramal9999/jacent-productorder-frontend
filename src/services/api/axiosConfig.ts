import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import {
    getSecureCookie,
    removeSecureCookie,
} from '@/utils/secure-storage';

export const AUTH_TOKEN_COOKIE = 'auth_token';

/**
 * Base URL for the backend API. Defaults to the relative `/api` path so
 * requests go through Next's rewrite (see `next.config.ts`) and look
 * same-origin to the browser — this avoids CORS preflight entirely.
 * Override with `NEXT_PUBLIC_AUTH_API_BASE_URL` only if you need to hit
 * the backend directly (e.g. from a non-Next host).
 */
export const AUTH_API_BASE_URL =
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? '/api';

/**
 * Shared axios instance for backend calls. Centralizes:
 * - baseURL
 * - default headers
 * - auth token injection (request interceptor)
 * - 401 handling (response interceptor)
 */
const axiosInstance: AxiosInstance = axios.create({
    baseURL: AUTH_API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// ----- Request interceptor: attach Bearer token if we have one -----
axiosInstance.interceptors.request.use(
    (config) => {
        // Cookie value is AES-encrypted at rest; getSecureCookie gives the plain JWT.
        const token = getSecureCookie(AUTH_TOKEN_COOKIE);
        if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ----- Response interceptor: log the user out on 401 -----
// On any 401 we tear down auth state (cookie + Redux slice + legacy zustand
// UI flag) and bounce the user to /login. We skip this for the logout call
// itself to avoid recursing.
let isHandling401 = false;
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const url = (error.config?.url ?? '').toString();
        const isLogoutCall = url.includes('/auth/logout');

        if (status === 401 && !isLogoutCall && !isHandling401) {
            isHandling401 = true;
            removeSecureCookie(AUTH_TOKEN_COOKIE, { path: '/' });
            try {
                // Lazy imports to avoid circular module deps with the store.
                const [{ store }, { logout }, { useUIStore }] = await Promise.all([
                    import('@/store/store'),
                    import('@/store/authSlice'),
                    import('@/stores/useUIStore'),
                ]);
                store.dispatch(logout());
                useUIStore.getState().unauthorize();
            } catch {
                // Non-fatal — cookie removal already happened above.
            }
            if (
                typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/login')
            ) {
                window.location.href = '/login';
            }
            // Reset the guard on the next tick so a future 401 (after a fresh
            // login) still triggers the handler.
            setTimeout(() => {
                isHandling401 = false;
            }, 0);
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;

// ---------------------------------------------------------------------------
// RTK-Query base query built on top of the shared axios instance.
// ---------------------------------------------------------------------------

export type AxiosBaseQueryArgs = {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
    params?: AxiosRequestConfig['params'];
    headers?: AxiosRequestConfig['headers'];
};

export type AxiosBaseQueryError = {
    status?: number;
    data?: unknown;
    message?: string;
};

export const axiosBaseQuery =
    (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
    async ({ url, method = 'GET', data, params, headers }) => {
        try {
            const result = await axiosInstance({ url, method, data, params, headers });
            return { data: result.data };
        } catch (e) {
            const err = e as AxiosError;
            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                },
            };
        }
    };
