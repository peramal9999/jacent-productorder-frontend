'use client';

import { useUI } from '@/hooks/use-UI';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/routes';
import { useLogoutMutation as useRtkLogoutMutation } from '@/store/authApi';

/**
 * Compatibility wrapper around the RTK-Query logout mutation, exposing the
 * same `mutate(...)` shape that the rest of the codebase already calls.
 * This keeps the existing logout-button wiring working without edits.
 */
export const useLogoutMutation = () => {
    const { unauthorize } = useUI();
    const router = useRouter();
    const [trigger, state] = useRtkLogoutMutation();

    const mutate = async (
        _arg?: undefined,
        opts?: {
            onSuccess?: () => void;
            onError?: (e: unknown) => void;
        },
    ) => {
        try {
            await trigger().unwrap();
            // Mirror the legacy zustand UI flag so anything still reading it stays in sync.
            unauthorize();
            router.push(ROUTES.LOGIN as any);
            opts?.onSuccess?.();
        } catch (e) {
            console.error('Logout error response:', e);
            opts?.onError?.(e);
        }
    };

    return { mutate, ...state };
};
