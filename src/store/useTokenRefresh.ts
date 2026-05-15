'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from './hooks';
import { useRefreshMutation } from './authApi';
import { REFRESH_TOKEN_INTERVAL_IN_MILLISECONDS } from '@/utils/constants';

/**
 * Schedules a silent POST /auth/refresh every
 * REFRESH_TOKEN_INTERVAL_IN_MILLISECONDS (230 minutes) while the user is
 * authenticated. The interval is torn down on logout so we don't keep
 * hammering the backend after the session ends.
 *
 * Refresh requests use the existing axios instance, which automatically
 * attaches the current Bearer token. The endpoint's `onQueryStarted`
 * persists the new token (cookie + Redux + legacy zustand flag), or
 * signs the user out if refresh fails.
 */
export const useTokenRefresh = () => {
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const [refresh] = useRefreshMutation();
    // Pause refresh while the tab is hidden to avoid burning calls in background.
    const visibleRef = useRef<boolean>(true);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const onVis = () => {
            visibleRef.current = document.visibilityState === 'visible';
        };
        onVis();
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const id = setInterval(() => {
            if (!visibleRef.current) return;
            refresh();
        }, REFRESH_TOKEN_INTERVAL_IN_MILLISECONDS);

        return () => clearInterval(id);
    }, [isAuthenticated, refresh]);
};
