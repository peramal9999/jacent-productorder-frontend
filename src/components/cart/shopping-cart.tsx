'use client'
import { useCart } from '@/hooks/use-cart';

import React from "react";
import {CartItemList} from "@/components/cart/cart-item-list";

import {OrderSummary} from "@/components/cart/order-summary";
import EmptyCart from "@/components/cart/empty-cart";
import {useIsMounted} from "@/utils/use-is-mounted";
import Loading from "@/components/shared/loading";

const ShoppingCart: React.FC = () => {
	const {items: cartItems, total: subtotal, isEmpty} = useCart();
	const mounted = useIsMounted();

	// Shipping charges removed — total equals subtotal.
	const total = subtotal;

	if (!mounted) {
		return <Loading/>;
	}

	if (isEmpty) {
		return (
			<div className="flex flex-col items-center justify-center py-16 lg:py-30 bg-white rounded-md">
				<EmptyCart/>
			</div>
		);
	}
	return (
		<div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4 xl:gap-8">
			{/* Left Section - Cart Items */}
			<div className="bg-white w-full px-5 md:p-8  rounded-lg space-y-6 border border-border-base ">
				<CartItemList items={cartItems}/>
			</div>

			{/* Right Section - Order Summary */}
			<div className="">
				<OrderSummary subtotal={subtotal} total={total}/>
			</div>
		</div>
	);

}
export default ShoppingCart;
