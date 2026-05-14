'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, CalendarDays, Package } from 'lucide-react';
import Button from '@/components/shared/button';
import QuantityInput from '@/components/shared/quantity-input';
import usePrice from '@/services/product/use-price';
import {
    useGetOrderByIdQuery,
    type OrderItem,
} from '@/store/ordersApi';
import { useCart } from '@/hooks/use-cart';
import { ROUTES } from '@/utils/routes';
import { useIsMounted } from '@/utils/use-is-mounted';
import Loading from '@/components/shared/loading';

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

function OrderItemRow({
    item,
    quantity,
    onQuantityChange,
}: {
    item: OrderItem;
    quantity: number;
    onQuantityChange: (qty: number) => void;
}) {
    const { price: lineTotal } = usePrice({
        amount: item.price * quantity,
        currencyCode: 'USD',
    });
    const { price: unitPrice } = usePrice({
        amount: item.price,
        currencyCode: 'USD',
    });

    return (
        <div className="flex items-center gap-3 md:gap-4 py-4 border-b border-border-base last:border-0">
            <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded overflow-hidden">
                {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-brand-dark truncate">
                    {item.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{unitPrice} each</div>
            </div>
            <div className="shrink-0">
                <QuantityInput
                    value={quantity}
                    min={1}
                    size="sm"
                    onChange={onQuantityChange}
                />
            </div>
            <div className="text-sm font-semibold text-brand-dark shrink-0 w-20 text-right">
                {lineTotal}
            </div>
        </div>
    );
}

export default function OrderDetailContent({ orderId }: { orderId: string }) {
    const mounted = useIsMounted();
    const router = useRouter();
    const { data: order, isLoading } = useGetOrderByIdQuery(orderId);
    const { addItemWithQuantity } = useCart();
    const [isReordering, setIsReordering] = useState(false);

    // Editable quantities (do NOT mutate the persisted order).
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (order) {
            setQuantities(
                Object.fromEntries(
                    order.items.map((it) => [String(it.id), it.quantity ?? 1]),
                ),
            );
        }
    }, [order]);

    const editedTotal = useMemo(() => {
        if (!order) return 0;
        return order.items.reduce((sum, it) => {
            const q = quantities[String(it.id)] ?? (it.quantity ?? 1);
            return sum + it.price * q;
        }, 0);
    }, [order, quantities]);

    const editedItemCount = useMemo(() => {
        if (!order) return 0;
        return order.items.reduce((sum, it) => {
            const q = quantities[String(it.id)] ?? (it.quantity ?? 1);
            return sum + q;
        }, 0);
    }, [order, quantities]);

    const { price: totalFmt } = usePrice({
        amount: editedTotal,
        currencyCode: 'USD',
    });

    if (!mounted || isLoading) {
        return <Loading />;
    }

    if (!order) {
        return (
            <div className="bg-white border border-border-base rounded-md p-10 text-center">
                <h2 className="text-lg font-semibold text-brand-dark mb-2">
                    Order not found
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                    This order doesn&apos;t exist or may have been removed.
                </p>
                <Link
                    href={ROUTES.ORDERS}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium border border-border-base rounded hover:bg-gray-50"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to orders
                </Link>
            </div>
        );
    }

    const handleReorder = async () => {
        if (isReordering) return;
        setIsReordering(true);
        try {
            // Add each order line to the cart at the (possibly edited)
            // quantity. Run sequentially so the server can apply each
            // POST /v1/cart/items in order without racing.
            for (const it of order.items) {
                const qty = quantities[String(it.id)] ?? it.quantity ?? 1;
                if (qty <= 0) continue;
                const itemId = (it.itemId ?? it.id) as string | number;
                await addItemWithQuantity({ id: itemId }, qty);
            }
            router.push(ROUTES.CART);
        } catch (e) {
            console.error('Failed to reorder:', e);
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <div>
            <Link
                href={ROUTES.ORDERS}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark mb-4"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to orders
            </Link>

            <div className="bg-white border border-border-base rounded-md p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5 border-b border-border-base">
                    <div>
                        <div className="flex items-center gap-2 text-brand-dark flex-wrap">
                            <Package className="w-5 h-5" />
                            <h1 className="text-lg md:text-xl font-semibold">
                                {order.orderNumber}
                            </h1>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold uppercase tracking-wide">
                                {order.orderType || 'Wholesale'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {formatDate(order.createdAt)}
                        </div>
                    </div>
                    <Button
                        variant="formButton"
                        disabled={isReordering}
                        className="!px-5 !py-2.5 !text-sm inline-flex items-center gap-1.5 self-start md:self-auto"
                        onClick={handleReorder}
                    >
                        <RotateCcw className="w-4 h-4" />
                        {isReordering ? 'Reordering…' : 'Reorder'}
                    </Button>
                </div>

                <p className="text-xs text-gray-500 pt-4">
                    Adjust quantities below before reordering. Your original order is
                    preserved.
                </p>

                <div className="pt-2">
                    {order.items.map((item) => (
                        <OrderItemRow
                            key={item.id}
                            item={item}
                            quantity={
                                quantities[String(item.id)] ?? (item.quantity ?? 1)
                            }
                            onQuantityChange={(next) =>
                                setQuantities((prev) => ({
                                    ...prev,
                                    [String(item.id)]: next,
                                }))
                            }
                        />
                    ))}
                </div>

                <div className="pt-5 mt-5 border-t border-border-base flex justify-between text-base font-semibold text-brand-dark">
                    <span>
                        Total{' '}
                        <span className="text-gray-500 font-normal text-sm">
                            ({editedItemCount} item{editedItemCount === 1 ? '' : 's'})
                        </span>
                    </span>
                    <span>{totalFmt}</span>
                </div>
            </div>
        </div>
    );
}
