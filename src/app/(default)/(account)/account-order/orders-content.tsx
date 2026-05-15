'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Package, Inbox, CalendarDays, ArrowRight } from 'lucide-react';
import usePrice from '@/services/product/use-price';
import { ROUTES } from '@/utils/routes';
import { useGetOrdersQuery, type Order } from '@/store/ordersApi';
import {
    quarterOfDate,
    formatQuarterLabel,
    type QuarterKey,
} from '@/stores/useOrderStore';
import { useIsMounted } from '@/utils/use-is-mounted';
import Loading from '@/components/shared/loading';

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

function OrderRow({ order }: { order: Order }) {
    const { price: totalFmt } = usePrice({ amount: order.total, currencyCode: 'USD' });
    const itemCount = order.items.reduce((sum, it) => sum + (it.quantity ?? 1), 0);

    return (
        <Link
            href={`${ROUTES.ORDER_DETAIL}/${order.id}`}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 md:p-5 bg-white border border-border-base rounded-md hover:shadow-md hover:border-brand-dark/20 transition"
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-brand-dark font-semibold">
                    <Package className="w-4 h-4" />
                    {order.orderNumber}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold uppercase tracking-wide">
                        {order.orderType || 'Wholesale'}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[13px] text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {formatDate(order.createdAt)}
                    </span>
                    <span>
                        {itemCount} item{itemCount === 1 ? '' : 's'}
                    </span>
                    <span className="font-semibold text-brand-dark">{totalFmt}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-sm font-medium text-brand-dark">
                View details
                <ArrowRight className="w-4 h-4" />
            </div>
        </Link>
    );
}

export default function OrdersContent() {
    const mounted = useIsMounted();
    const { data, isLoading } = useGetOrdersQuery();
    const orders: Order[] = data ?? [];
    const [selectedQuarter, setSelectedQuarter] = useState<QuarterKey | 'all'>('all');

    const availableQuarters = useMemo<QuarterKey[]>(() => {
        const keys = new Set<QuarterKey>();
        orders.forEach((o) => keys.add(quarterOfDate(o.createdAt)));
        return Array.from(keys).sort().reverse();
    }, [orders]);

    const visibleOrders = useMemo(() => {
        if (selectedQuarter === 'all') return orders;
        return orders.filter((o) => quarterOfDate(o.createdAt) === selectedQuarter);
    }, [orders, selectedQuarter]);

    if (!mounted || isLoading) {
        return <Loading />;
    }

    // No orders yet — empty state.
    if (orders.length === 0) {
        return (
            <div className="bg-white border border-dashed border-border-base rounded-md p-10 md:p-16 text-center">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-50 mb-5">
                    <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">
                    No past orders yet
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                    Once you place your first order, it will appear here. You&apos;ll be
                    able to view order details and reorder any time.
                </p>
                <Link
                    href={ROUTES.CATEGORY}
                    className="inline-block px-6 py-2.5 text-sm font-medium bg-brand-dark text-white rounded hover:opacity-90 transition"
                >
                    Start shopping
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-3">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-sm font-semibold md:text-xl text-brand-dark">
                        Order History
                    </h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-brand-dark text-xs font-semibold">
                        {orders.length} order{orders.length === 1 ? '' : 's'}
                    </span>
                </div>
                {/* <div className="flex items-center gap-2">
                    <label htmlFor="quarter-filter" className="text-sm text-gray-500">
                        Show:
                    </label>
                    <select
                        id="quarter-filter"
                        value={selectedQuarter}
                        onChange={(e) =>
                            setSelectedQuarter(e.target.value as QuarterKey | 'all')
                        }
                        className="px-3 py-2 text-sm border border-border-base rounded bg-white focus:outline-none focus:border-brand-dark"
                    >
                        <option value="all">All quarters</option>
                        {availableQuarters.map((q) => (
                            <option key={q} value={q}>
                                {formatQuarterLabel(q)}
                            </option>
                        ))}
                    </select>
                </div> */}
            </div>

            {visibleOrders.length === 0 ? (
                <div className="bg-white border border-dashed border-border-base rounded-md p-10 text-center">
                    <p className="text-sm text-gray-500">
                        No orders in{' '}
                        <span className="font-medium">
                            {formatQuarterLabel(selectedQuarter as QuarterKey)}
                        </span>
                        .
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleOrders.map((order) => (
                        <OrderRow key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
