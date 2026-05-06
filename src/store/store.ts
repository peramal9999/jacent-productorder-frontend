import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './authApi';
import authReducer from './authSlice';
import { cartApi } from './cartApi';
import { productsApi } from './productsApi';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        [cartApi.reducerPath]: cartApi.reducer,
        [productsApi.reducerPath]: productsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            cartApi.middleware,
            productsApi.middleware,
        ),
    devTools: process.env.NODE_ENV !== 'production',
});

// Enables refetchOnFocus / refetchOnReconnect when used.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
