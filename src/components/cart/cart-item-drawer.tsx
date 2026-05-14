'use client'
import Link from '@/components/shared/link';
import Image from '@/components/shared/image';
import { useCart } from '@/hooks/use-cart';
import usePrice from '@/services/product/use-price';
import {ROUTES} from '@/utils/routes';
import QuantityInput from '@/components/shared/quantity-input';
import { type Item } from "@/hooks/use-cart";

type CartItemProps = {
    item: Item;
};

const CartItemDrawer: React.FC<CartItemProps> = ({item}) => {

    const {
        removeItem,
        updateItem,
        useCartHelpers
    } = useCart();

    const unitAmount = item?.sale_price ?? item?.price ?? 0;
    const {price: subtotal} = usePrice({
        amount: unitAmount * (item?.quantity ?? 0),
        currencyCode: 'USD',
    });
    const { isInStock, isInCart } = useCartHelpers(); // Get helpers
    const outOfStock = isInCart(item?.id) && !isInStock(item.id);
    const displayName = item?.itemDesc ?? item?.itemDesc;
    return (
        <div
            className={`group w-full flex border-b border-neutral-100 dark:border-neutral-700/70 py-4 md:py-5 relative last:border-b-0`}
        >
            <div
                className="relative flex rounded overflow-hidden shrink-0  w-[80px] ">
                <div className="block leading-5 transition-all text-brand-dark text-sm lg:text-15px hover:text-brand"
                >
                    <Image
                        src={item?.image ?? ''}
                        width={80}
                        height={80}
                        alt={item.name || 'Product Image'}
                        className="object-cover bg-fill-thumbnail"
                    />
                </div>
            </div>
            
            <div className="flex items-start justify-between w-full overflow-hidden">
                <div className="ltr:pl-3 rtl:pr-3 md:ltr:pl-5 md:rtl:pr-5">
                    <div className="block leading-5 transition-all text-brand-dark text-sm lg:text-15px"
                    >
                        {displayName}
                    </div>
                    {item?.itemId != null && (
                        <div className="text-xs text-gray-500 mt-1">
                            Item ID: {String(item.itemId)}
                        </div>
                    )}
                    {/* {item?.itemDesc && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {item.itemDesc}
                        </div>
                    )} */}
                    <div className="text-sm font-semibold text-brand-dark mt-2 block mb-2">
                        {item.price}
                    </div>
                    
                    <div className={"flex gap-2 md:gap-4 items-center"}>
                        <QuantityInput
                            value={item.quantity ?? 1}
                            min={1}
                            size="sm"
                            onChange={(next) => updateItem(item.id, { quantity: next })}
                        />

                        <div
                            onClick={() => removeItem(item.cartItemId)}
                            className=" transition-all text-gray-500 text-13px underline cursor-pointer"
                        >
                            Remove
                        </div>
                    </div>
                    
                  
                </div>
            
            
            </div>
        </div>
    );
};

export default CartItemDrawer;
