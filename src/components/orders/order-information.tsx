'use client';

import cn from 'classnames';
import React from 'react';
import Link from '@/components/shared/link';
import { colorMap } from '@/data/color-settings';
import { usePanel } from '@/hooks/use-panel';
import { useOrderStore } from '@/stores/useOrderStore';
import { useIsMounted } from '@/utils/use-is-mounted';
import Loading from '@/components/shared/loading';
import { ROUTES } from '@/utils/routes';

export default function OrderInformation() {
    const { selectedColor } = usePanel();
    const mounted = useIsMounted();
    // Read the most recent order from the local order store (the one just placed).
    const latestOrder = useOrderStore((s) => s.orders[0]);

    if (!mounted) return <Loading />;

    return (
        <div className="py-10 lg:py-10">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 xl:gap-8">
                {/* Left Section - Thank You Message */}
                <div className="bg-white w-full px-5 md:px-8 py-8 rounded-lg space-y-6 border border-border-base">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-base md:text-lg xl:text-[20px] font-semibold text-brand-dark lg:pt-0">
                            Thank you for your order!
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold uppercase tracking-wide">
                            {latestOrder?.orderType || 'Wholesale'}
                        </span>
                    </div>

                    {latestOrder ? (
                        <p>
                            Your order number is{' '}
                            <span className="font-medium">{latestOrder.orderNumber}</span>.
                        </p>
                    ) : (
                        <p>Your order has been recorded.</p>
                    )}

                    <p className="leading-8">
                        An email will be sent containing information about your purchase. If
                        you have any questions about your purchase, email us at{' '}
                        <Link
                            href="mailto:customersupport@jacentretail.com"
                            className={cn(
                                colorMap[selectedColor].link,
                                'hover:underline',
                            )}
                        >
                            customersupport@jacentretail.com
                        </Link>{' '}
                        or call us at{' '}
                        <Link
                            href="tel:(1800)-000-6890"
                            className={cn(
                                colorMap[selectedColor].link,
                                'hover:underline',
                            )}
                        >
                            (1800)-000-6890
                        </Link>
                        .
                    </p>

                    <div className="pt-6 border-t border-border-base flex flex-col sm:flex-row gap-3">
                        {latestOrder && (
                            <Link
                                href={`${ROUTES.ORDER_DETAIL}/${latestOrder.id}`}
                                variant="button-black"
                                className="sm:inline-block"
                            >
                                VIEW ORDER
                            </Link>
                        )}
                        <Link
                            href={ROUTES.CATEGORY}
                            variant="button-border"
                            className="sm:inline-block"
                        >
                            CONTINUE SHOPPING
                        </Link>
                    </div>
                </div>

                {/* Right Section - placeholder summary */}
                <div className="bg-white p-6 rounded-lg border border-border-base">
                    <h3 className="text-base font-semibold text-brand-dark mb-3">
                        Order details
                    </h3>
                    {latestOrder ? (
                        <dl className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Order #</dt>
                                <dd className="font-medium text-brand-dark">
                                    {latestOrder.orderNumber}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Type</dt>
                                <dd className="font-medium text-brand-dark">
                                    {latestOrder.orderType || 'Wholesale'}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Items</dt>
                                <dd className="font-medium text-brand-dark">
                                    {latestOrder.items.reduce(
                                        (n, i) => n + (i.quantity ?? 1),
                                        0,
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-border-base">
                                <dt className="font-semibold text-brand-dark">Total</dt>
                                <dd className="font-bold text-brand-dark">
                                    ${latestOrder.total.toFixed(2)}
                                </dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="text-sm text-gray-500">No order details available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
