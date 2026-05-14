import React from 'react';
import cn from 'classnames';
import Image from '@/components/shared/image';
import { Product } from '@/services/types';
import { productPlaceholder } from '@/assets/placeholders';
import { useCart } from '@/hooks/use-cart';
import usePrice from '@/services/product/use-price';
import BtnRemoveWishlist from '@/components/product/productListing/productCardsUI/btn-remove-wishlist';
import AddToCart from '@/components/product/add-to-cart';

interface ProductProps {
    product: Product;
    className?: string;
    variant?: string;
    removeWishlist?: (id: string) => void;
}

const ProductCard: React.FC<ProductProps> = ({
    product,
    className,
    variant = 'default',
    removeWishlist,
}) => {
    const { id, name, image, sale_price, price } = product;
    const upcCode =
        (product as { upcCode?: string }).upcCode ??
        (product.sku as string | undefined) ??
        '';
    const customerItemCode = (product as { customerItemCode?: string }).customerItemCode;
    const stockLevel = (product as { stockLevel?: number }).stockLevel ?? 0;
    const isTopSeller = (product as { isTopSeller?: boolean }).isTopSeller;
    const imageSrc = `https://jsmitemimage.s3.us-east-2.amazonaws.com/${id}.jpg`;

    const { useCartHelpers } = useCart();
    const { outOfStock: cartOutOfStock } = useCartHelpers();
    const isOOS = cartOutOfStock(id) || stockLevel === 0;

    const { price: displayPrice, basePrice } = usePrice({
        amount: sale_price ? sale_price : price,
        baseAmount: price,
        currencyCode: 'USD',
    });

    return (
        <article
            className={cn(
                'group relative flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden',
                'transition-all duration-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5',
                className,
            )}
        >
            <BtnRemoveWishlist product={product} removeWishlist={removeWishlist} />

            {/* Image + badges */}
            <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={name || 'Product Image'}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Top-left badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {isTopSeller && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-semibold uppercase tracking-wide shadow">
                            ★ Top seller
                        </span>
                    )}
                    {/* {isOOS && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-semibold uppercase tracking-wide shadow">
                            Out of Stock
                        </span>
                    )} */}
                </div>

                {/* Top-right: product ID chip */}
                <span className="absolute top-2 right-2 z-10 inline-flex items-center px-2 py-0.5 bg-teal-500/90 text-white rounded text-[10px] font-semibold tracking-wide shadow">
                    #{id}
                </span>

                {/* Hover overlay add-to-cart (lg+ only) */}
                {/* {!isOOS && ( */}
                    <div
                        className={cn(
                            'absolute inset-x-2 bottom-2 z-10 hidden lg:flex justify-center',
                            'opacity-0 translate-y-2 transition-all duration-200',
                            'group-hover:opacity-100 group-hover:translate-y-0',
                        )}
                    >
                        <AddToCart
                            data={product}
                            variant="dark"
                            className="!min-w-0 w-full !text-[12px] !py-2 shadow-lg"
                        />
                    </div>
                {/* )} */}
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-3 gap-1.5">
                <h3
                    className="text-[13px] leading-snug font-medium text-brand-dark line-clamp-2 min-h-[34px]"
                    title={name}
                >
                    {name}
                </h3>

                <div className="flex flex-col gap-0.5 text-[11px] text-gray-500 font-mono leading-tight">
                    {upcCode && (
                        <span className="truncate">
                            UPC <span className="text-gray-700">{upcCode}</span>
                        </span>
                    )}
                    {customerItemCode && (
                        <span className="truncate">
                            Cust# <span className="text-gray-700">{customerItemCode}</span>
                        </span>
                    )}
                </div>

                {stockLevel > 0 && stockLevel <= 10 && (
                    <p className="text-[11px] font-semibold text-amber-600">
                        Only {stockLevel} left
                    </p>
                )}

                <div className="mt-auto pt-2 flex items-baseline gap-2">
                    <span className="text-base md:text-lg font-bold text-brand-dark">
                        {displayPrice}
                    </span>
                    {basePrice && (
                        <del className="text-xs text-gray-400">{basePrice}</del>
                    )}
                </div>

                {/* Mobile / tablet: persistent Add to Cart below the body.
                    Hidden on lg because the hover overlay handles it there. */}
                <div className="lg:hidden mt-2">
                    {/* {isOOS ? (
                        <button
                            disabled
                            className="w-full px-3 py-2 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
                        >
                            Out of Stock
                        </button>
                    ) : ( */}
                        <AddToCart
                            data={product}
                            variant="dark"
                            className="!min-w-0 w-full !text-[12px] !py-2"
                        />
                    {/* )} */}
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
