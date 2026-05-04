'use client';

import usePrice from '@/services/product/use-price';
import cn from 'classnames';
import { useCart } from '@/hooks/use-cart';
import Button from '@/components/shared/button';
import {CheckoutItem} from '@/components/checkout/checkout-card-item';
import {CheckoutCardFooterItem} from './checkout-card-footer-item';
import {useRouter} from 'next/navigation';
import {ROUTES} from '@/utils/routes';
import {useIsMounted} from '@/utils/use-is-mounted';
import {useOrderStore} from '@/stores/useOrderStore';
import {useCartStore} from '@/stores/useCartStore';
import React from 'react';
import Loading from "@/components/shared/loading";

const CheckoutCard: React.FC = () => {
    const router = useRouter();

    const {items, total, isEmpty} = useCart();
    const placeOrder = useOrderStore((s) => s.placeOrder);
    const resetCart = useCartStore((s) => s.resetCart);
    const {price: subtotal} = usePrice({
        amount: total,
        currencyCode: 'USD',
    });

    function orderHeader() {
        if (isEmpty) return;
        // Record the order in past-orders history so it shows up in /account-order
        // and can be reordered later. Keep the existing confirmation flow.
        placeOrder(items, total);
        resetCart();
        router.push(ROUTES.ORDER as any);
    }
    
    const checkoutFooter = [
        {
            id: 1,
            name: 'Subtotal',
            price: subtotal,
        },
        {
            id: 2,
            name: 'Order total',
            price: subtotal,
        },
    ];
    
    const mounted = useIsMounted();
    
    if (!mounted) {
        return (
            <div className="bg-white p-5 md:p-8 border rounded-md border-border-base">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-base">
                    <h2 className="text-lg font-medium text-brand-dark">Order Summary</h2>
                </div>
                <Loading/>
            </div>
        );
    }
    
    return (
        
            <div className="bg-white p-5 md:p-8 border rounded-md border-border-base">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-base">
                    <h2 className="text-lg font-medium text-brand-dark">Order Summary</h2>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold uppercase tracking-wide">
                        Wholesale
                    </span>
                </div>

                <div className="space-y-4 pb-5">
	                {isEmpty ? (
	                    <p className="py-4">Your cart is empty.</p>
	                ) : (
	                    items.map((item) => <CheckoutItem item={item} key={item.id} />)
	                )}
	        </div>
                
                {!isEmpty && (
                    <>
                        <div className={"space-y-2 pt-5 border-t border-border-base"}>
                            {checkoutFooter.map((item: any) => (
                                    <CheckoutCardFooterItem item={item} key={item.id}/>
                            ))}
                        </div>
                        
                        <Button
                            variant="dark"
                            className={cn(
                                'w-full mt-8  uppercase  px-4 py-3 transition-all',
                            )}
                            onClick={orderHeader}
                        >
                            Order Now
                        </Button>
                    </>
                )}
            
            </div>
        
        
    );
};

export default CheckoutCard;
