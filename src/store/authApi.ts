import { createApi } from '@reduxjs/toolkit/query/react';
import {
    axiosBaseQuery,
    AUTH_TOKEN_COOKIE,
} from '@/services/api/axiosConfig';
import { setCredentials, logout, type AuthUser } from './authSlice';
import { useUIStore } from '@/stores/useUIStore';
import { setSecureCookie } from '@/utils/secure-storage';

export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
}

export interface LoginResponse {
    token: string;
    user?: AuthUser;
    /** Some backends return the token under a different field. */
    accessToken?: string;
    [key: string]: unknown;
}

export interface RefreshResponse {
    token?: string;
    accessToken?: string;
    user?: AuthUser;
    [key: string]: unknown;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    /** Some backends auto-issue a token on register. */
    token?: string;
    accessToken?: string;
    user?: AuthUser;
    message?: string;
    [key: string]: unknown;
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Me'],
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                data: body,
            }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const token = data.token ?? data.accessToken;
                    if (!token) return;

                    // Persist token to cookie so middleware sees it on the next nav.
                    const isHttps =
                        typeof window !== 'undefined' &&
                        window.location.protocol === 'https:';
                    setSecureCookie(AUTH_TOKEN_COOKIE, token, {
                        expires: 7,
                        path: '/',
                        sameSite: 'Lax',
                        ...(isHttps ? { secure: true } : {}),
                    });

                    dispatch(setCredentials({ token, user: data.user }));
                    // Bridge to the legacy zustand UI flag so anything still
                    // reading `useUI().isAuthorized` stays in sync.
                    useUIStore.getState().authorize();
                } catch {
                    // RTK Query has already surfaced the error to the caller.
                }
            },
        }),

        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                data: body,
            }),
            // Intentionally NOT auto-signing the user in even if the backend
            // returns a token on register. We always show the success screen
            // and require the user to sign in explicitly.
        }),

        me: builder.query<AuthUser, void>({
            query: () => ({ url: '/auth/me', method: 'GET' }),
            providesTags: ['Me'],
            async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data } = await queryFulfilled;
                    // Mirror the fetched profile into the auth slice so any
                    // component reading `state.auth.user` stays in sync
                    // (without forcing every component onto useMeQuery).
                    const token =
                        (getState() as { auth?: { token?: string | null } }).auth
                            ?.token ?? '';
                    if (token) dispatch(setCredentials({ token, user: data }));
                } catch {
                    /* RTK Query surfaces the error to the caller */
                }
            },
        }),

        /**
         * Silent token refresh. Called on a fixed interval (see
         * REFRESH_TOKEN_INTERVAL_IN_MILLISECONDS) so the user's session
         * stays alive while they're active.
         *
         * The current Bearer token is attached automatically by the axios
         * request interceptor. If the backend returns a new token, we
         * update the cookie + Redux state.
         */
        refresh: builder.mutation<RefreshResponse, void>({
            query: () => ({ url: '/auth/refresh', method: 'POST' }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const token = data.token ?? data.accessToken;
                    if (!token) return;

                    const isHttps =
                        typeof window !== 'undefined' &&
                        window.location.protocol === 'https:';
                    setSecureCookie(AUTH_TOKEN_COOKIE, token, {
                        expires: 7,
                        path: '/',
                        sameSite: 'Lax',
                        ...(isHttps ? { secure: true } : {}),
                    });

                    dispatch(setCredentials({ token, user: data.user }));
                    useUIStore.getState().authorize();
                } catch {
                    // Refresh failed (likely expired beyond grace period).
                    // Sign the user out so the middleware bounces them to /login.
                    dispatch(logout());
                    useUIStore.getState().unauthorize();
                }
            },
        }),

        /**
         * Sign the user out. Calls POST /auth/logout so the backend can
         * invalidate the session, then tears down all client-side auth state
         * (Redux slice, auth_token cookie, legacy zustand flag) regardless
         * of the API result — we always want the user logged out locally.
         */
        logout: builder.mutation<unknown, void>({
            query: () => ({ url: '/auth/logout', method: 'POST' }),
            async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (e) {
                    // Surface to the console for visibility, but proceed
                    // with the client-side cleanup below.
                    console.warn('Backend /auth/logout failed:', e);
                }
                dispatch(logout());
                useUIStore.getState().unauthorize();
            },
            invalidatesTags: ['Me'],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useMeQuery,
    useLogoutMutation,
    useRefreshMutation,
} = authApi;
