import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Item } from '@/services/utils/cartUtils';
import { encryptedLocalStorage } from '@/utils/secure-storage';

export type PastOrder = {
    id: string;
    orderNumber: string;
    createdAt: string; // ISO
    items: Item[];
    total: number;
    /** Order classification stamped at submission (e.g. 'Wholesale'). */
    orderType: string;
};

interface OrderState {
    orders: PastOrder[];
    demoSeeded: boolean;
    placeOrder: (items: Item[], total: number) => PastOrder;
    getOrderById: (id: string) => PastOrder | undefined;
    seedDemoOrders: () => void;
}

const generateOrderNumber = () => {
    // e.g. ORD-20260423-4F2A
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `ORD-${y}${m}${d}-${rand}`;
};

const generateId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const imgUrl = (id: string) =>
    `https://jsmitemimage.s3.us-east-2.amazonaws.com/${id}.jpg`;

const makeItem = (
    id: string,
    name: string,
    price: number,
    quantity: number,
): Item => ({
    id,
    name,
    slug: id,
    image: imgUrl(id),
    price,
    quantity,
});

const buildDemoOrders = (): PastOrder[] => {
    const orders: Array<{
        createdAt: string;
        orderNumber: string;
        items: Item[];
    }> = [
        {
            // Q2 2026 — most recent
            createdAt: '2026-04-15T09:32:00Z',
            orderNumber: 'ORD-20260415-A7C1',
            items: [
                makeItem('13083', 'JAMMI BIBS 3PK', 8.49, 2),
                makeItem('73017', 'DIAPER DISPOSAL BAGS 72CT', 0, 1),
                makeItem('19994', 'MICROFIBER DUST CLOTHS 3CT KC', 4.99, 3),
            ],
        },
        {
            // Q1 2026
            createdAt: '2026-02-08T14:10:00Z',
            orderNumber: 'ORD-20260208-B4E2',
            items: [
                makeItem('51070', 'BOTTLE BRUSH KC', 6.99, 2),
                makeItem('19994', 'MICROFIBER DUST CLOTHS 3CT KC', 4.99, 1),
            ],
        },
        {
            // Q4 2025
            createdAt: '2025-12-03T11:45:00Z',
            orderNumber: 'ORD-20251203-9F08',
            items: [
                makeItem('24239', 'STOPPERS SILICONE 4CT TB', 7.99, 1),
                makeItem('24240', 'ICE TRAY SILICONE COCKTAIL TB', 8.99, 1),
                makeItem('24247', 'CORKSCREW WAITERS GOLD TB', 9.99, 1),
                makeItem('16499', 'BAG CLIP MAGNETIC 7CT CE', 5.79, 2),
            ],
        },
        {
            // Q3 2025
            createdAt: '2025-09-21T16:22:00Z',
            orderNumber: 'ORD-20250921-3D5A',
            items: [
                makeItem('16500', 'BAG CLIP SOFTGRIP 4CT CE', 4.69, 4),
                makeItem('13083', 'JAMMI BIBS 3PK', 8.49, 1),
            ],
        },
    ];

    return orders.map((o) => ({
        id: generateId(),
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        items: o.items,
        total: o.items.reduce(
            (sum, it) => sum + it.price * (it.quantity ?? 1),
            0,
        ),
        orderType: 'Wholesale',
    }));
};

export const useOrderStore = create<OrderState>()(
    persist(
        (set, get) => ({
            orders: [],
            demoSeeded: false,
            placeOrder: (items, total) => {
                const newOrder: PastOrder = {
                    id: generateId(),
                    orderNumber: generateOrderNumber(),
                    createdAt: new Date().toISOString(),
                    // Deep copy so later cart mutations don't bleed in.
                    items: items.map((i) => ({ ...i })),
                    total,
                    // All orders submitted through this portal are wholesale.
                    orderType: 'Wholesale',
                };
                set((state) => ({ orders: [newOrder, ...state.orders] }));
                return newOrder;
            },
            getOrderById: (id) => get().orders.find((o) => o.id === id),
            seedDemoOrders: () => {
                const state = get();
                if (state.demoSeeded || state.orders.length > 0) return;
                set({ orders: buildDemoOrders(), demoSeeded: true });
            },
        }),
        {
            name: 'razor-orders',
            storage: createJSONStorage(() => encryptedLocalStorage),
            partialize: (state) => ({
                orders: state.orders,
                demoSeeded: state.demoSeeded,
            }),
        },
    ),
);

// ---- Quarter helpers ----
export type QuarterKey = `${number}-Q${1 | 2 | 3 | 4}`;

export const quarterOfDate = (iso: string): QuarterKey => {
    const d = new Date(iso);
    const q = (Math.floor(d.getMonth() / 3) + 1) as 1 | 2 | 3 | 4;
    return `${d.getFullYear()}-Q${q}` as QuarterKey;
};

export const formatQuarterLabel = (key: QuarterKey): string => {
    const [year, q] = key.split('-');
    return `${q} ${year}`;
};
