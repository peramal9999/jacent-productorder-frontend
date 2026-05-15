import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/services/api/axiosConfig';

/**
 * Server-side cart shape. Field names follow the existing client `Item`
 * shape so the rest of the UI continues to work without per-component
 * remapping. Backends that name the cart-item identifier differently
 * (e.g. `cartItemId`) are normalised in the `transformResponse`.
 */
export interface CartItem {
    id: string | number;
    itemId?: string | number;
    cartItemId?: string | number;
    name: string;
    itemName?: string;
    itemDesc?: string;
    slug?: string;
    image?: string;
    price: number;
    sale_price?: number;
    quantity: number;
    stock?: number;
    [key: string]: unknown;
}

export interface Cart {
    id?: string | number;
    items: CartItem[];
    total: number;
    [key: string]: unknown;
}

type RawCartItem = Partial<CartItem> & {
    cartItemId?: string | number;
    itemId?: string | number;
    itemName?: string;
    itemDesc?: string;
    qty?: number;
};

type RawCart =
    | (Partial<Cart> & {
          cartItems?: RawCartItem[];
          totalAmount?: number;
          subtotal?: number;
      })
    | RawCartItem[];

const normaliseItem = (raw: RawCartItem): CartItem => ({
    ...raw,
    id: (raw.id ?? raw.cartItemId ?? raw.itemId)!,
    itemId: raw.itemId ?? raw.id,
    cartItemId: raw.cartItemId ?? raw.id,
    name: (raw.name ?? raw.itemName ?? '') as string,
    itemName: (raw.itemName ?? raw.name) as string | undefined,
    itemDesc: raw.itemDesc as string | undefined,
    price: Number(raw.price ?? raw.sale_price ?? 0),
    quantity: Number(raw.quantity ?? raw.qty ?? 0),
});

const normaliseCart = (raw: RawCart | undefined): Cart => {
    if (!raw) return { items: [], total: 0 };
    const rawItems: RawCartItem[] = Array.isArray(raw)
        ? raw
        : raw.cartItems ?? raw.items ?? [];
    const items = rawItems.map(normaliseItem);
    const explicitTotal = !Array.isArray(raw)
        ? raw.total ?? raw.totalAmount ?? raw.subtotal
        : undefined;
    const total =
        typeof explicitTotal === 'number'
            ? explicitTotal
            : items.reduce((s, i) => s + i.price * i.quantity, 0);
    return {
        ...(Array.isArray(raw) ? {} : raw),
        items,
        total,
    };
};

export interface AddCartItemRequest {
    itemId: string | number;
    quantity: number;
    [key: string]: unknown;
}

export interface UpdateCartItemRequest {
    itemId: string | number;
    quantity: number;
}

export const cartApi = createApi({
    reducerPath: 'cartApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Cart'],
    endpoints: (builder) => ({
        getCart: builder.query<Cart, void>({
            query: () => ({ url: '/v1/cart', method: 'GET' }),
            transformResponse: (response: RawCart) => normaliseCart(response),
            providesTags: ['Cart'],
        }),

        addCartItem: builder.mutation<Cart, AddCartItemRequest>({
            query: (body) => ({
                url: '/v1/cart/items',
                method: 'POST',
                data: body,
            }),
            transformResponse: (response: RawCart) => normaliseCart(response),
            invalidatesTags: ['Cart'],
        }),

        updateCartItem: builder.mutation<
            Cart,
            { cartItemId: string | number; data: UpdateCartItemRequest }
        >({
            query: ({ data }) => ({
                url: `/v1/cart/items`,
                method: 'POST',
                data,
            }),
            transformResponse: (response: RawCart) => normaliseCart(response),
            invalidatesTags: ['Cart'],
        }),

        deleteCartItem: builder.mutation<Cart, string | number>({
            query: (cartItemId) => ({
                url: `/v1/cart/items/${cartItemId}`,
                method: 'DELETE',
            }),
            transformResponse: (response: RawCart) => normaliseCart(response),
            invalidatesTags: ['Cart'],
        }),

        deleteCart: builder.mutation<void, void>({
            query: () => ({ url: '/v1/cart', method: 'DELETE' }),
            invalidatesTags: ['Cart'],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddCartItemMutation,
    useUpdateCartItemMutation,
    useDeleteCartItemMutation,
    useDeleteCartMutation,
} = cartApi;
