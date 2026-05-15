'use client';
import { type Item } from "@/hooks/use-cart";
import Image from '@/components/shared/image';
import usePrice from '@/services/product/use-price';
import React from "react";

const CheckoutItemComponent: React.FC<{ item: Item }> = ({ item }) => {
  const unitAmount = item.sale_price ?? item.price ?? 0;
  const { price } = usePrice({
    amount: unitAmount * (item.quantity ?? 0),
    currencyCode: 'USD',
  });

  return (
    <div className="flex items-center">
      <div className="flex w-16 h-16 border rounded-md border-border-base shrink-0">
        <Image
          src={item.image ?? ''}
          alt={'item image'}
          className="rounded-md"
          width={64}
          height={64}
        />
      </div>
        <div className="ltr:pl-3 rtl:pr-3 min-w-0 flex-1">
            <h6 className="font-normal text-15px text-brand-dark truncate">
                <span className="font-medium">{item.quantity} x </span>
                {item.itemDesc ?? item.itemName ?? item.name}
            </h6>
            {(item.itemId ?? item.id) != null && (
                <p className="text-[11px] text-gray-500 mt-0.5">
                    Item ID: {String(item.itemId ?? item.id)}
                </p>
            )}
        </div>
        <div className="w-24 text-end font-semibold ltr:ml-auto rtl:mr-auto text-15px text-brand-dark ltr:pl-2 rtl:pr-2 shrink-0">
        {price}
      </div>
    </div>
  );
};

export const CheckoutItem = React.memo(CheckoutItemComponent);
