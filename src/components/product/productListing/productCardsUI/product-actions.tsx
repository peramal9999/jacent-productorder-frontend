import React from 'react';
import { Product } from '@/services/types';
import { useCart } from '@/hooks/use-cart';

const AddToCart = React.lazy(() => import('@/components/product/add-to-cart'));

interface ProductActionsProps {
    product: Product;
    variant?: string;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product, variant = 'mercury' }) => {
    const { id } = product;
    const { useCartHelpers } = useCart();
    const { outOfStock } = useCartHelpers();
    const cartOutOfStock = outOfStock(id);
    // Inventory-driven out of stock (independent of what's in the cart)
    const stockOutOfStock =
        (product as { stockLevel?: number }).stockLevel === 0;
    const isOOS = cartOutOfStock || stockOutOfStock;

    return (
        <div className="product-cart-button flex justify-center w-full">
            {isOOS ? (
                <button
                    disabled
                    className="min-w-[150px] px-4 py-2 leading-6 font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full text-[13px] cursor-not-allowed"
                >
                    Out of Stock
                </button>
            ) : (
                <AddToCart data={product} variant={variant} />
            )}
        </div>
    );
};

export default ProductActions;
