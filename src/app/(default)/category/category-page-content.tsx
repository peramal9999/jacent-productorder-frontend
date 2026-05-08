'use client';
import { Element } from 'react-scroll';
import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '@/components/category/top-bar';
import { ProductGrid } from '@/components/product/productListing/product-grid';
import Filters from '@/components/filter/filters';
import DrawerFilter from '@/components/category/drawer-filter';
import Pagination from '@/components/shared/pagination';
import { GrNext, GrPrevious } from 'react-icons/gr';
import { useGetProductsPageQuery } from '@/store/productsApi';
import { usePathname } from 'next/navigation';
import useQueryParam from '@/utils/use-query-params';
import { useFilterStore, getSelectedCategoryIds } from '@/stores/useFilterStore';
import CategoryBanner from '@/components/category/category-banner';
import { getBannerForSelection } from '@/data/category-banners';

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

    // 1-based for the UI (rc-pagination), 0-based when sent to the API.
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Snap back to page 1 whenever the filter inputs that affect the
    // total result set change. Without this the user can end up on
    // page 5 of a result set that only has 1 page.
    useEffect(() => {
        setCurrentPage(1);
    }, [commodityIds, newQuery.sort_by, pageSize]);

    const { data: page, isFetching } = useGetProductsPageQuery({
        pageNo: currentPage - 1,
        pageSize,
        sortBy: newQuery.sort_by,
        commodityId: commodityIds,
    });

    // Defensive cap: trim to the selected page size in case the backend
    // returns more rows than requested. This guarantees the user always
    // sees the number of records they picked from the page-size dropdown.
    const products = useMemo(
        () => (page?.content ? page.content.slice(0, pageSize) : page?.content),
        [page?.content, pageSize],
    );
    const totalElements = page?.totalElements ?? 0;
    const showPagination = totalElements > 0;

    return (
        <Element name="category" className="flex products-category">
            <div className="sticky hidden lg:block h-full shrink-0 ltr:pr-7 rtl:pl-7   w-[300px] top-16 ">
                <Filters />
            </div>
            <div className="w-full">
                <CategoryBanner banner={banner} />
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
