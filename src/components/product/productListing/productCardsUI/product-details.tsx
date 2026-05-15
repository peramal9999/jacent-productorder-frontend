import React from 'react';
import { Product } from '@/services/types';
import cn from 'classnames';

interface ProductDetailsProps {
    product: Product;
    variant?: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, variant = 'default' }) => {
    const { name } = product;
    const upcCode =
        (product as { upcCode?: string }).upcCode ??
        (product.sku as string | undefined) ??
        '';
    const customerItemCode = (product as { customerItemCode?: string }).customerItemCode;
    const stockLevel = (product as { stockLevel?: number }).stockLevel;

    return (
        <div className="flex flex-col">
            <h3
                className={cn(
                    'leading-snug line-clamp-2 mb-1 font-medium',
                    {
                        'text-brand-dark text-sm min-h-[40px]':
                            variant === 'default' || variant === 'large',
                        'text-fill-purple text-sm min-h-[40px]':
                            variant === 'outBorder' || variant === 'cardList',
                        'text-brand-dark text-base font-semibold min-h-[30px]':
                            variant === 'list' || variant === 'bestdeal',
                        'text-fill-purple text-sm dark:text-black min-h-[40px]':
                            variant === 'furni',
                    },
                )}
                title={name}
            >
                {name}
            </h3>

            {upcCode && (
                <p className="text-[11px] text-gray-500 font-mono truncate mb-0.5">
                    UPC: <span className="text-gray-700">{upcCode}</span>
                </p>
            )}

            {customerItemCode && (
                <p className="text-[11px] text-gray-500 font-mono truncate mb-1">
                    Cust #: <span className="text-gray-700">{customerItemCode}</span>
                </p>
            )}

            {typeof stockLevel === 'number' && stockLevel > 0 && stockLevel <= 10 && (
                <p className="text-[11px] font-medium text-amber-600 mb-1">
                    Only {stockLevel} left
                </p>
            )}
        </div>
    );
};

export default ProductDetails;
