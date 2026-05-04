import React from 'react';
import Link from '@/components/shared/link';
import { ROUTES } from '@/utils/routes';

interface OrderSummaryProps {
	subtotal: number;
	total: number;
}

export function OrderSummary({ subtotal, total }: OrderSummaryProps) {
	return (
		<div className={' p-5 md:p-8  bg-white  rounded-lg border border-border-base'}>
			<div className="flex items-center justify-between pb-3 mb-3 border-b border-border-base">
				<h2 className="text-lg font-medium text-brand-dark">Order Summary</h2>
				<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold uppercase tracking-wide">
					Wholesale
				</span>
			</div>
			<div className="flex items-center justify-between pb-4 mb-5 font-medium text-brand-dark">
				<span className="text-lg">Subtotal</span>
				<span className="text-lg">${subtotal.toFixed(2)}</span>
			</div>

			<div className="flex justify-between font-bold text-lg pt-2 border-t border-border-base">
				<span>Total</span>
				<span>${total.toFixed(2)}</span>
			</div>

			<div className={'mt-6'}>
				<Link href={ROUTES.CHECKOUT} variant={'button-black'} className="w-full">
					<span className="py-0.5">Check Out</span>
				</Link>
			</div>
		</div>
	);
}
