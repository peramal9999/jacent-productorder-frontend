'use client';
import { Element } from 'react-scroll';
import React, { useState, useMemo } from 'react';
import TopBar from '@/components/category/top-bar';
import { ProductLoadMore } from '@/components/product/productListing/product-loadmore';
import Filters from '@/components/filter/filters';
import DrawerFilter from '@/components/category/drawer-filter';
import { LIMITS } from '@/services/utils/limits';
import { useGetAllProductsInfiniteQuery } from '@/store/productsApi';
import { usePathname } from 'next/navigation';
import useQueryParam from '@/utils/use-query-params';
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

    // The filter store stores either the literal "all" or commodity ids
    // (numeric strings) keyed by the commodities returned from
    // /v1/filterOptions. Pass them through to the server when present so
    // the API can scope results, and skip the param when "all" is active.
    const commodityIds = useMemo(
        () =>
            selectedCategoryIds.filter(
                (id) => id !== 'all' && /^\d+$/.test(id),
            ),
        [selectedCategoryIds],
    );

    const limit = LIMITS.PRODUCTS_LIMITS;
    const {
        isFetching: isLoading,
        isFetchingNextPage: loadingMore,
        fetchNextPage,
        hasNextPage,
        data,
    } = useGetAllProductsInfiniteQuery({
        pageSize: limit,
        sortBy: newQuery.sort_by,
        commodityId: commodityIds,
    });

    // Adapt RTK Query's infinite-query shape (`data.pages: ProductsPage[]`)
    // to what `<ProductLoadMore />` already understands
    // (`data.pages: PaginatedProduct[]`).
    const adaptedData = useMemo(
        () =>
            data
                ? {
                      pages: data.pages.map((p) => ({
                          data: p.content,
                          paginatorInfo: {
                              nextPage:
                                  p.pageNo + 1 < p.totalPages
                                      ? p.pageNo + 2
                                      : null,
                              total: p.totalElements,
                          },
                      })),
                      pageParams: data.pageParams,
                  }
                : undefined,
        [data],
    );

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
                    data={adaptedData as unknown as Parameters<typeof ProductLoadMore>[0]['data']}
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
