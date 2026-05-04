import React, {FC} from 'react';

import Button from '@/components/shared/button';
import ProductCard from '@/components/product/productListing/productCards/product-card';
import ProductCardLoader from '@/components/shared/loaders/product-card-loader';
import ProductCardList from '@/components/product/productListing/productCards/product-list';
import {LIMITS} from '@/services/utils/limits';
import {PaginatedProduct, Product} from '@/services/types';
import {InfiniteData} from "@tanstack/react-query";


interface ProductProps {
	data?: InfiniteData<PaginatedProduct, unknown>; // Use InfiniteData from useInfiniteQuery
	isLoading?: boolean;
	className?: string;
	fetchNextPage?: () => void;
	hasNextPage?: boolean;
	loadingMore?: boolean;
	viewAs: boolean;
}

export const ProductLoadMore: FC<ProductProps> = ({data,isLoading,fetchNextPage,hasNextPage,loadingMore,className = '', viewAs}) => {
	const limit = LIMITS.PRODUCTS_LIMITS || 15;

	// Show skeletons while fetching OR while we haven't received the first page yet.
	// Without the !data check, there is a frame where isLoading is false but data
	// is still undefined — producing an empty grid.
	const hasData = !!data?.pages?.length;
	const showSkeleton = isLoading || !hasData;

	return (
		<>
			<div
				className={`${viewAs ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4' : 'grid grid-cols-1 gap-3'} ${className}`}
			>
				{showSkeleton ? (
					Array.from({length: limit}).map((_, idx) => (
						<div className={"p-2 h-full rounded bg-white"} key={`product--key-${idx}`}>
							<ProductCardLoader
								uniqueKey={`product--key-${idx}`}
							/>
						</div>
					))
				) : (
					data?.pages?.map((page: PaginatedProduct) => {
						if (viewAs) {
							return page.data.map((product: Product) => (
								<ProductCard key={`product--key-${product.id}`} product={product} />
							));
						} else {
							return page.data.map((product: Product) => (
								<ProductCardList key={`product--key-${product.id}`} product={product} />
							));
						}
					})
				)}
				{/* end of error state */}
			</div>

			<div className="mt-1.5 py-5 text-center bg-white rounded">
				{hasNextPage ? (
					<Button
						loading={loadingMore}
						disabled={loadingMore}
						onClick={() => fetchNextPage?.()}
						className={'w-60 xs:capitalize'}
						variant={'primary'}
					>
						Load More
					</Button>
				) : (
					!showSkeleton && hasData && (
						<p className="text-brand-dark">No more products to load</p>
					)
				)}
			</div>
		</>
	);
};
