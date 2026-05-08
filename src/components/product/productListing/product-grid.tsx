import React, { FC } from 'react';
import ProductCard from '@/components/product/productListing/productCards/product-card';
import ProductCardLoader from '@/components/shared/loaders/product-card-loader';
import ProductCardList from '@/components/product/productListing/productCards/product-list';
import { Product } from '@/services/types';

interface ProductGridProps {
    products?: Product[];
    isLoading?: boolean;
    skeletonCount?: number;
    viewAs: boolean;
    className?: string;
}

/**
 * Pure grid: no pagination, no fetching. Renders skeletons while
 * `isLoading` is true and the product list otherwise. Used by the
 * server-paginated category page so pagination controls can live
 * outside the grid.
 */
export const ProductGrid: FC<ProductGridProps> = ({
    products,
    isLoading,
    skeletonCount = 20,
    viewAs,
    className = '',
}) => {
    const showSkeleton = isLoading || !products;

    return (
        <div
            className={`${
                viewAs
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4'
                    : 'grid grid-cols-1 gap-3'
            } ${className}`}
        >
            {showSkeleton
                ? Array.from({ length: skeletonCount }).map((_, idx) => (
                      <div
                          className="p-2 h-full rounded bg-white"
                          key={`product-skeleton-${idx}`}
                      >
                          <ProductCardLoader uniqueKey={`product-skeleton-${idx}`} />
                      </div>
                  ))
                : products?.map((product) =>
                      viewAs ? (
                          <ProductCard
                              key={`product--key-${product.id}`}
                              product={product}
                          />
                      ) : (
                          <ProductCardList
                              key={`product--key-${product.id}`}
                              product={product}
                          />
                      ),
                  )}
        </div>
    );
};

export default ProductGrid;
