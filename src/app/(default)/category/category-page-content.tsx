'use client';
import { Element } from 'react-scroll';
import React, { useMemo, useRef, useState } from 'react';
import TopBar from '@/components/category/top-bar';
import { ProductGrid } from '@/components/product/productListing/product-grid';
import Filters from '@/components/filter/filters';
import DrawerFilter from '@/components/category/drawer-filter';
import Pagination from '@/components/shared/pagination';
import { GrNext, GrPrevious } from 'react-icons/gr';
import { useGetProductsPageQuery, type GetProductsPageArgs } from '@/store/productsApi';
import { usePathname } from 'next/navigation';
import useQueryParam from '@/utils/use-query-params';
import { useFilterStore, getSelectedCategoryIds } from '@/stores/useFilterStore';

const PAGE_SIZE_OPTIONS = [20, 40, 60, 100];
const DEFAULT_PAGE_SIZE = 20;

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

    // Single source of truth for what we ask the server. Combining
    // pageNo/pageSize/filters in one state guarantees we only make ONE
    // request per user action, instead of firing a request with the
    // stale pageNo first and then a second one once the page reset
    // effect runs.
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Whenever the filters that affect the result set change, snap the
    // user back to page 1 *before* the next render so RTK Query only
    // sees `pageNo: 0` for the new filter. Computing this during render
    // (instead of via useEffect) avoids the intermediate fetch you'd
    // otherwise get for `{ newFilter, oldPageNo }`.
    const filterFingerprint = JSON.stringify({
        sort: newQuery.sort_by ?? null,
        ids: commodityIds,
        size: pageSize,
    });
    const lastFingerprint = useRef(filterFingerprint);
    if (lastFingerprint.current !== filterFingerprint) {
        lastFingerprint.current = filterFingerprint;
        if (currentPage !== 1) setCurrentPage(1);
    }

    const queryArgs: GetProductsPageArgs = useMemo(
        () => ({
            pageNo: currentPage - 1,
            pageSize,
            sortBy: newQuery.sort_by,
            commodityId: commodityIds,
        }),
        [currentPage, pageSize, newQuery.sort_by, commodityIds],
    );

    const {
        data: page,
        currentData,
        isFetching,
    } = useGetProductsPageQuery(queryArgs);

    // Use `currentData` (data for the *current* args only) for the grid
    // — RTK Query's `data` keeps the previous successful result while a
    // refetch is in flight, which would briefly show records from the
    // previous (possibly larger) page or filter. Cap to the selected
    // page size as a final safety net.
    const products = useMemo(
        () =>
            currentData?.content
                ? currentData.content.slice(0, pageSize)
                : undefined,
        [currentData?.content, pageSize],
    );
    const totalElements = (currentData ?? page)?.totalElements ?? 0;
    const showPagination = totalElements > 0;

    return (
        <Element name="category" className="flex products-category">
            <div className="sticky hidden lg:block h-full shrink-0 ltr:pr-7 rtl:pl-7   w-[300px] top-16 ">
                <Filters />
            </div>
            <div className="w-full">
                <DrawerFilter />
                <TopBar viewAs={viewAs} setViewAs={setViewAs} />

                <ProductGrid
                    products={products}
                    isLoading={isFetching}
                    skeletonCount={pageSize}
                    viewAs={viewAs}
                />

                {showPagination && (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-3 px-3 py-3 bg-white rounded">
                        <label className="flex items-center gap-2 text-sm text-brand-dark">
                            <span>Show</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="h-9 px-2 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-dark"
                                aria-label="Items per page"
                            >
                                {PAGE_SIZE_OPTIONS.map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span className="text-gray-500">
                                of {totalElements} items
                            </span>
                        </label>

                        <Pagination
                            current={currentPage}
                            onChange={(p) => setCurrentPage(p)}
                            pageSize={pageSize}
                            total={totalElements}
                            prevIcon={
                                <GrPrevious
                                    size={14}
                                    className="m-auto my-1.5 rtl:rotate-180"
                                />
                            }
                            nextIcon={
                                <GrNext
                                    size={14}
                                    className="m-auto my-1.5 rtl:rotate-180"
                                />
                            }
                            className="blog-pagination"
                        />
                    </div>
                )}
            </div>
        </Element>
    );
}
