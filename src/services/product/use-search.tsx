import { useEffect, useRef, useState } from 'react';
import { useSearchItemsQuery } from '@/store/productsApi';
import type { Product } from '@/services/types';
import type { QueryOptionsType } from '@/services/types';

const MIN_CHARS = 3;
/** Wait this long after the user stops typing before firing a request. */
const DEBOUNCE_MS = 300;
/** Floor on the gap between any two consecutive API requests. */
const THROTTLE_MS = 800;

/**
 * Combined debounce + throttle.
 *
 * - Debounce: don't commit a new search until the user pauses typing for
 *   `debounceMs`. Prevents one request per keystroke for slow typists.
 * - Throttle: even if the user types continuously, never commit faster
 *   than `throttleMs` apart. Caps the rate during long bursts.
 */
const useDebouncedThrottled = (
    value: string,
    debounceMs: number,
    throttleMs: number,
) => {
    const [committed, setCommitted] = useState(value);
    const lastFiredAt = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        const sinceLastFire = Date.now() - lastFiredAt.current;
        // Wait at least `debounceMs`, and at least until `throttleMs` has
        // elapsed since the previous commit.
        const wait = Math.max(debounceMs, throttleMs - sinceLastFire);
        timerRef.current = setTimeout(() => {
            lastFiredAt.current = Date.now();
            setCommitted(value);
        }, wait);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [value, debounceMs, throttleMs]);

    return committed;
};

export const useSearchQuery = (options: QueryOptionsType) => {
    const text = (options?.text ?? '').toString().trim();
    const committed = useDebouncedThrottled(text, DEBOUNCE_MS, THROTTLE_MS);

    const hasQuery = committed.length >= MIN_CHARS;

    const { data, isLoading, isFetching } = useSearchItemsQuery(committed, {
        skip: !hasQuery,
    });

    // While the user is mid-typing (text differs from the throttled
    // committed value) the dropdown should still show the loading
    // state, otherwise it would briefly flash old results.
    const isTyping = text.length >= MIN_CHARS && text !== committed;

    return {
        data: hasQuery ? ((data ?? []) as Product[]) : [],
        isLoading: hasQuery ? isLoading || isFetching || isTyping : isTyping,
    };
};
