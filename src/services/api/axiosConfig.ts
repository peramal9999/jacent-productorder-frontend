import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import {
    getSecureCookie,
    removeSecureCookie,
} from '@/utils/secure-storage';

export const AUTH_TOKEN_COOKIE = 'auth_token';

/**
 * Base URL for the auth/backend API. Falls back to localhost during dev.
 * Override per-environment with `NEXT_PUBLIC_AUTH_API_BASE_URL`.
 */
export const AUTH_API_BASE_URL =
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? 'http://localhost:8081/api';

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

// ----- Response interceptor: clear stale token on 401 -----
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            removeSecureCookie(AUTH_TOKEN_COOKIE, { path: '/' });
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
