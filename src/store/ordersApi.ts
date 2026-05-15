import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/services/api/axiosConfig';

/**
 * Server-side order shape. Fields are kept aligned with the previous local
 * `PastOrder` so the existing UI keeps rendering without per-component
 * remapping. Backends that name things differently (e.g. `orderId`,
 * `placedAt`, `totalAmount`, `cartItems`) are normalised below.
 */
export interface OrderItem {
    id: string | number;
    itemId?: string | number;
    name: string;
    slug?: string;
    image?: string;
    price: number;
    sale_price?: number;
    quantity: number;
    [key: string]: unknown;
}

export interface Order {
    id: string;
    orderNumber: string;
    createdAt: string;
    items: OrderItem[];
    total: number;
    orderType: string;
    [key: string]: unknown;
}

type RawOrderItem = Partial<OrderItem> & {
    cartItemId?: string | number;
    orderItemId?: string | number;
    productId?: string | number;
    qty?: number;
    itemName?: string;
    itemDesc?: string;
    imageUrl?: string;
    unitPrice?: number;
    retailPrice?: number;
};

type RawOrder = Partial<Order> & {
    orderId?: string | number;
    orderNo?: string | number;
    placedAt?: string;
    createdOn?: string;
    orderDate?: string;
    status?: string;
    items?: RawOrderItem[];
    cartItems?: RawOrderItem[];
    orderItems?: RawOrderItem[];
    /** Backend variant: `orderItem` (singular) holds the line array. */
    orderItem?: RawOrderItem[];
    totalAmount?: number;
    subtotal?: number;
    type?: string;
};

/**
 * Some endpoints return the order as a single flat object, others wrap
 * the header in `order` and the lines in `orderItem`:
 *   { order: { orderId, ... }, orderItem: [...] }
 * Flatten that shape to the single-object form before normalising.
 */
type WrappedOrder = { order?: RawOrder; orderItem?: RawOrderItem[] };

const unwrapOrder = (raw: RawOrder | WrappedOrder | undefined): RawOrder | undefined => {
    if (!raw) return undefined;
    const w = raw as WrappedOrder;
    if (w.order && Array.isArray(w.orderItem)) {
        return { ...w.order, orderItem: w.orderItem };
    }
    return raw as RawOrder;
};

const S3_IMAGE = (id: unknown) =>
    `https://jsmitemimage.s3.us-east-2.amazonaws.com/${id}.jpg`;

const normaliseOrderItem = (raw: RawOrderItem): OrderItem => {
    const itemId = raw.itemId ?? raw.productId ?? raw.id;
    const price = Number(raw.price ?? raw.unitPrice ?? raw.sale_price ?? 0);
    const retail = Number(raw.retailPrice ?? 0);
    return {
        ...raw,
        id: (raw.id ?? raw.orderItemId ?? raw.cartItemId ?? itemId)!,
        itemId,
        name:
            raw.name ?? raw.itemDesc ?? raw.itemName ??
            (itemId ? `Item ${itemId}` : ''),
        slug: raw.slug ?? (itemId ? String(itemId) : undefined),
        image: raw.image ?? raw.imageUrl ?? (itemId ? S3_IMAGE(itemId) : ''),
        price,
        // Surface retailPrice as the strike-through baseline so the
        // order detail rows can show "was $X" if/when wanted.
        ...(retail > 0 ? { retailPrice: retail } : {}),
        quantity: Number(raw.quantity ?? raw.qty ?? 0),
    };
};

const normaliseOrder = (input: RawOrder | WrappedOrder | undefined): Order => {
    const raw = unwrapOrder(input);
    if (!raw) {
        return {
            id: '',
            orderNumber: '',
            createdAt: new Date().toISOString(),
            items: [],
            total: 0,
            orderType: 'Wholesale',
        };
    }
    const rawItems: RawOrderItem[] =
        raw.items ?? raw.cartItems ?? raw.orderItems ?? raw.orderItem ?? [];
    const items = rawItems.map(normaliseOrderItem);
    const explicitTotal = raw.total ?? raw.totalAmount ?? raw.subtotal;
    const total =
        typeof explicitTotal === 'number'
            ? explicitTotal
            : items.reduce((s, i) => s + i.price * i.quantity, 0);
    const id = String(raw.id ?? raw.orderId ?? '');
    return {
        ...raw,
        id,
        orderNumber: String(raw.orderNumber ?? raw.orderNo ?? (id ? `#${id}` : '')),
        createdAt: String(
            raw.createdAt ??
                raw.placedAt ??
                raw.createdOn ??
                raw.orderDate ??
                new Date().toISOString(),
        ),
        items,
        total,
        orderType: raw.orderType ?? raw.type ?? raw.status ?? 'Wholesale',
    };
};

const normaliseOrders = (raw: unknown): Order[] => {
    const list: Array<RawOrder | WrappedOrder> = Array.isArray(raw)
        ? (raw as Array<RawOrder | WrappedOrder>)
        : ((raw as { content?: Array<RawOrder | WrappedOrder>; data?: Array<RawOrder | WrappedOrder>; orders?: Array<RawOrder | WrappedOrder> })
              ?.content ??
          (raw as { data?: Array<RawOrder | WrappedOrder> })?.data ??
          (raw as { orders?: Array<RawOrder | WrappedOrder> })?.orders ??
          []);
    return list.map(normaliseOrder);
};

export interface PlaceOrderItem {
    itemId: string | number;
    quantity: number;
}

export interface PlaceOrderRequest {
    items: PlaceOrderItem[];
    total?: number;
}

export const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Orders', 'Order'],
    endpoints: (builder) => ({
        getOrders: builder.query<Order[], void>({
            query: () => ({ url: '/v1/orders', method: 'GET' }),
            transformResponse: (response: unknown) => normaliseOrders(response),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map((o) => ({ type: 'Order' as const, id: o.id })),
                          { type: 'Orders' as const, id: 'LIST' },
                      ]
                    : [{ type: 'Orders' as const, id: 'LIST' }],
        }),

        getOrderById: builder.query<Order, string | number>({
            query: (id) => ({ url: `/v1/orders/${id}`, method: 'GET' }),
            transformResponse: (response: RawOrder | WrappedOrder) =>
                normaliseOrder(response),
            providesTags: (_r, _e, id) => [{ type: 'Order', id }],
        }),

        placeOrder: builder.mutation<Order, PlaceOrderRequest>({
            query: (body) => ({
                url: '/v1/orders',
                method: 'POST',
                data: body,
            }),
            transformResponse: (
                response: RawOrder | WrappedOrder | string,
            ) => {
                // POST /v1/orders returns just the new order id as a bare
                // string (e.g. "b7bb496b-0854-452d-bdd0-1416f257c86f").
                // Wrap it so downstream code can re-fetch the full order
                // via GET /v1/orders/{id}.
                if (typeof response === 'string') {
                    return normaliseOrder({ id: response.trim() });
                }
                return normaliseOrder(response);
            },
            invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
        }),

    }),
});

export const {
    useGetOrdersQuery,
    useGetOrderByIdQuery,
    usePlaceOrderMutation,
} = ordersApi;
