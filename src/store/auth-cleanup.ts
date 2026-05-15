import type { AppDispatch } from './store';
import { authApi } from './authApi';
import { cartApi } from './cartApi';
import { productsApi } from './productsApi';
import { ordersApi } from './ordersApi';
import { logout as logoutAction } from './authSlice';
import { useUIStore } from '@/stores/useUIStore';
import { useFilterStore, DEFAULT_PRICE_RANGE } from '@/stores/useFilterStore';

const SESSION_KEYS_TO_CLEAR = ['lastPlacedOrder'];

const LOCAL_KEYS_TO_CLEAR = [
    'auth_token',
    'token',
    'user',
    'cart',
    'cartItems',
    'wishlist',
];

/**
 * Tear down every piece of client-side state tied to the signed-in user.
 *
 * Called from both the explicit logout mutation and the 401 response
 * interceptor so a server-driven session expiry is indistinguishable
 * from a user-initiated logout.
 *
 * Order matters: Redux first (so any UI re-renders triggered by the
 * dispatch see fresh, empty caches), then storage, then zustand.
 */
export function clearClientAuthState(dispatch: AppDispatch): void {
    dispatch(logoutAction());

    dispatch(authApi.util.resetApiState());
    dispatch(cartApi.util.resetApiState());
    dispatch(productsApi.util.resetApiState());
    dispatch(ordersApi.util.resetApiState());

    if (typeof window !== 'undefined') {
        try {
            for (const key of SESSION_KEYS_TO_CLEAR) {
                window.sessionStorage.removeItem(key);
            }
        } catch {
            /* sessionStorage may be unavailable (private mode, etc.) */
        }
        try {
            for (const key of LOCAL_KEYS_TO_CLEAR) {
                window.localStorage.removeItem(key);
            }
        } catch {
            /* localStorage may be unavailable */
        }
    }

    try {
        useUIStore.setState({
            isAuthorized: false,
            displaySidebar: false,
            displayFilter: false,
            displaySearch: false,
            displayMobileSearch: false,
            displayDrawer: false,
            drawerView: null,
            data: null,
        });
    } catch {
        /* zustand store unavailable during SSR — safe to ignore */
    }

    try {
        useFilterStore.setState({
            selectedCategories: { all: true },
            priceRange: DEFAULT_PRICE_RANGE,
        });
    } catch {
        /* same as above */
    }
}
