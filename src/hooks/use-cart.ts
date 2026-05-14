import { useCallback, useMemo, useState } from 'react';
import { Product, VariationOption } from '@/services/types';
import { constructCartItem } from '@/utils/construct-cart-item';
import {
    useGetCartQuery,
    useAddCartItemMutation,
    useUpdateCartItemMutation,
    useDeleteCartItemMutation,
    useDeleteCartMutation,
    type CartItem,
} from '@/store/cartApi';

export type Item = CartItem;

/**
 * Server-backed cart hook. Replaces the previous zustand + localStorage
 * implementation; data is fetched via RTK Query (`/api/v1/cart`) and
 * mutations are sent through the cart endpoints, so the source of truth
 * lives on the backend.
 */
export const useCart = () => {
    const { data: cart } = useGetCartQuery();
    const [addCartItem] = useAddCartItemMutation();
    const [updateCartItem] = useUpdateCartItemMutation();
    const [deleteCartItem] = useDeleteCartItemMutation();
    const [deleteCart] = useDeleteCartMutation();

    const items: CartItem[] = cart?.items ?? [];

    const totalItems = useMemo(
        () => items.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
        [items],
    );
    const totalUniqueItems = items.length;
    const total = useMemo(() => {
        if (typeof cart?.total === 'number') return cart.total;
        return items.reduce(
            (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0),
            0,
        );
    }, [cart?.total, items]);
    const isEmpty = totalUniqueItems === 0;

    const addItemWithQuantity = useCallback(
        async (item: Partial<CartItem>, quantity: number) => {
            if (quantity <= 0) {
                throw new Error("cartQuantity can't be zero or less than zero");
            }
            const itemId = (item.id ?? item.id) as string | number;
            return addCartItem({ itemId: itemId, quantity }).unwrap();
        },
        [addCartItem],
    );

    const updateItem = useCallback(
        async (
            id: CartItem['id'],
            payload: Partial<CartItem> & { quantity?: number },
        ) => {
            if (typeof payload.quantity !== 'number') return;
            const row = items.find((i) => i.id === id);
            const itemId = (payload.itemId ?? row?.itemId ?? id) as
                | string
                | number;
            return updateCartItem({
                cartItemId: id,
                data: { itemId, quantity: payload.quantity },
            }).unwrap();
        },
        [updateCartItem, items],
    );

    const removeItem = useCallback(
        async (cartItemId: CartItem['cartItemId']) => deleteCartItem(cartItemId as string).unwrap(),
        [deleteCartItem],
    );

    const resetCart = useCallback(async () => {
        await deleteCart().unwrap();
    }, [deleteCart]);

    const useCartHelpers = () => {
        const isInCart = useCallback(
            (itemId: string | number) =>
                items.some(
                    (i) =>
                        (i.itemId ?? i.id) === itemId || i.id === itemId,
                ),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [items],
        );

        const getItemFromCart = useCallback(
            (itemId: string | number) =>
                items.find(
                    (i) =>
                        (i.itemId ?? i.id) === itemId || i.id === itemId,
                ),
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [items],
        );

        const isInStock = (itemId: string | number) => {
            const cartItem = getItemFromCart(itemId);
            if (cartItem && cartItem.stock !== undefined) {
                return (cartItem.quantity ?? 0) < cartItem.stock;
            }
            return true;
        };

        const outOfStock = (itemId: string | number) =>
            isInCart(itemId) && !isInStock(itemId);

        return { isInCart, getItemFromCart, isInStock, outOfStock };
    };

    const useCartActions = (
        data?: CartItem | Product,
        selectedVariation?: VariationOption,
        selectedQuantity: number = 1,
    ) => {
        const [addToCartLoader, setAddToCartLoader] = useState(false);

        const addToCart = async () => {
            if (!data) return;
            setAddToCartLoader(true);
            try {
                const item = constructCartItem(
                    data as Product,
                    selectedVariation as VariationOption,
                );
                await addItemWithQuantity(item, selectedQuantity);
            } catch (error) {
                console.error('Failed to add item to cart:', error);
            } finally {
                setTimeout(() => setAddToCartLoader(false), 500);
            }
        };

        return { addToCart, addToCartLoader };
    };

    return {
        items,
        total,
        totalItems,
        totalUniqueItems,
        isEmpty,
        addItemWithQuantity,
        updateItem,
        removeItem,
        resetCart,
        useCartHelpers,
        useCartActions,
        // Aliased forms used in older callsites.
        addItem: addItemWithQuantity,
        removeItemOrQuantity: removeItem,
    };
};
