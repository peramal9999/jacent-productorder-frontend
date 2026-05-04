'use client';
import { Element } from 'react-scroll';
import React, { useState, useMemo } from 'react';
import TopBar from '@/components/category/top-bar';
import { ProductLoadMore } from '@/components/product/productListing/product-loadmore';
import Filters from '@/components/filter/filters';
import DrawerFilter from '@/components/category/drawer-filter';
import { LIMITS } from '@/services/utils/limits';
import { useMoreProductsQuery } from '@/services/product/get-all-more-products';
import { usePathname } from 'next/navigation';
import useQueryParam from '@/utils/use-query-params';
import { InfiniteData } from '@tanstack/react-query';
import { PaginatedProduct } from '@/services/types';
import { useFilterStore, getSelectedCategoryIds } from '@/stores/useFilterStore';
import CategoryBanner from '@/components/category/category-banner';
import { getBannerForSelection } from '@/data/category-banners';

export default function CategoryPageContent() {
    const [viewAs, setViewAs] = useState(Boolean(true));
    const pathname = usePathname();
    const { getParams, query } = useQueryParam(pathname ?? '/');
    const newQuery: { sort_by?: string } = getParams(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}${query}`,
    );

    const selectedCategories = useFilterStore((s) => s.selectedCategories);
    const selectedCategoryIds = useMemo(
        () => getSelectedCategoryIds(selectedCategories),
        [selectedCategories],
    );
    const banner = useMemo(
        () => getBannerForSelection(selectedCategoryIds),
        [selectedCategoryIds],
    );

    // Get category query parameters
    const limit = LIMITS.PRODUCTS_LIMITS;
    const {
        isFetching: isLoading,
        isFetchingNextPage: loadingMore,
        fetchNextPage,
        hasNextPage,
        data,
    } = useMoreProductsQuery({
        limit: limit,
        sort_by: newQuery.sort_by,
        categories: selectedCategoryIds,
    });

    return (
        <Element name="category" className="flex products-category">
            <div className="sticky hidden lg:block h-full shrink-0 ltr:pr-7 rtl:pl-7   w-[300px] top-16 ">
                <Filters />
            </div>
            <div className="w-full">
                <CategoryBanner banner={banner} />
                <DrawerFilter />
                <TopBar viewAs={viewAs} setViewAs={setViewAs} />
                <ProductLoadMore
                    data={data as InfiniteData<PaginatedProduct, unknown>}
                    isLoading={isLoading}
                    fetchNextPage={fetchNextPage}
                    hasNextPage={hasNextPage}
                    loadingMore={loadingMore}
                    viewAs={viewAs}
                />
            </div>
        </Element>
    );
}
