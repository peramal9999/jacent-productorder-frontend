import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AUTH_TOKEN_COOKIE } from '@/services/api/axiosConfig';
import {
    getSecureCookie,
    removeSecureCookie,
} from '@/utils/secure-storage';

export interface AuthUser {
    id?: string | number;
    email?: string;
    name?: string;
    [key: string]: unknown;
}

export interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * Hydrate from cookie on app boot. Called once from the Redux provider
         * on the client so a refresh keeps the user signed in.
         */
        hydrateFromCookie(state) {
            const token = getSecureCookie(AUTH_TOKEN_COOKIE) ?? null;
            state.token = token;
            state.isAuthenticated = Boolean(token);
        },
        /**
         * Apply credentials returned by the login endpoint.
         */
        setCredentials(
            state,
            action: PayloadAction<{ token: string; user?: AuthUser }>,
        ) {
            state.token = action.payload.token;
            state.user = action.payload.user ?? state.user;
            state.isAuthenticated = true;
        },
        logout(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            removeSecureCookie(AUTH_TOKEN_COOKIE, { path: '/' });
        },
    },
});

export const { hydrateFromCookie, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
