'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { hydrateFromCookie } from './authSlice';
import { useTokenRefresh } from './useTokenRefresh';

/**
 * Inner component (mounted inside the Provider) so it can use Redux hooks.
 * Owns the periodic /auth/refresh interval.
 */
function TokenRefresher() {
    useTokenRefresh();
    return null;
}

/**
 * Wraps the app in the Redux Provider, seeds the auth slice from the
 * `auth_token` cookie on mount, and starts the silent token-refresh loop.
 */
export default function ReduxProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        store.dispatch(hydrateFromCookie());
    }, []);

    return (
        <Provider store={store}>
            <TokenRefresher />
            {children}
        </Provider>
    );
}
