"use client";

import React, {useMemo} from "react";
import {CategoriesFilter, type CategoryOption} from "@/components/filter/facets/categories-filter";
import {FilterSection} from "@/components/filter/facets/filter-section";

import {PriceRangeFilter} from "@/components/filter/facets/price-range-filter";
import {useFilters} from "@/hooks/use-filter-hooks";
import {useFilterStore} from "@/stores/useFilterStore";
import {useGetFilterOptionsQuery} from "@/store/productsApi";


const Filters = () => {
    const {
        sectionsOpen,
        toggleSection,
        priceRange,
        handlePriceRangeChange,
        expandedCategories,
        toggleCategoryExpand,
        MIN_PRICE,
        MAX_PRICE,
    } = useFilters();
    const storeSelectedCategories = useFilterStore((s) => s.selectedCategories);
    const toggleCategory = useFilterStore((s) => s.toggleCategory);

    // Categories come from `/api/v1/filterOptions`. We surface every
    // commodity (sorted A→Z by name) as a category checkbox, with a
    // synthetic "All" option pinned to the top so the user can always
    // clear their selection.
    const {data: filterOptions, isFetching: loadingFilters} =
        useGetFilterOptionsQuery();

    const categories = useMemo<CategoryOption[]>(() => {
        const all: CategoryOption = {id: "all", label: "All", count: 0};
        if (!filterOptions?.commodities?.length) return [all];
        const items = [...filterOptions.commodities]
            .sort((a, b) => a.commodity.localeCompare(b.commodity))
            .map<CategoryOption>((c) => ({
                id: String(c.commodityId),
                label: c.commodity,
                count: 0,
            }));
        return [all, ...items];
    }, [filterOptions]);


    return (
        <div className="rounded ">
            {/* Categories Filter */}
            <FilterSection title="Categories" isOpen={sectionsOpen.categories}
                           onToggle={() => toggleSection("categories")}>
                {loadingFilters && !filterOptions ? (
                    <p className="text-sm text-gray-500">Loading categories…</p>
                ) : (
                    <CategoriesFilter
                        categories={categories}
                        selectedCategories={storeSelectedCategories}
                        expandedCategories={expandedCategories}
                        onCategoryChange={(id, checked) => toggleCategory(id, checked)}
                        onCategoryExpand={toggleCategoryExpand}
                    />
                )}
            </FilterSection>
            
            {/* Price Range Filter */}
            <FilterSection title="Price range" isOpen={sectionsOpen.price} onToggle={() => toggleSection("price")}>
                <PriceRangeFilter min={MIN_PRICE} max={MAX_PRICE} value={priceRange} onChange={handlePriceRangeChange}/>
            </FilterSection>
            
            {/* Colors Filter */}
            {/* <FilterSection title="Colors" isOpen={sectionsOpen.colors} onToggle={() => toggleSection("colors")}>
                <ColorsFilter
                    colors={colorsData}
                    selectedColors={selectedFilters.colors}
                    onColorChange={(id, checked) => handleFilterChange("colors", id, checked)}
                />
            </FilterSection> */}
            
            {/* Sizes Filter */}
            {/* <FilterSection title="Size" isOpen={sectionsOpen.sizes} onToggle={() => toggleSection("sizes")}>
                <SizesFilter
                    sizes={sizesData}
                    selectedSizes={selectedFilters.sizes}
                    onSizeChange={(id, checked) => handleFilterChange("sizes", id, checked)}
                />
            </FilterSection> */}
            
            {/* <div className="pb-8 pr-2">
                <div className="flex justify-between items-center space-x-2">
                    <div>
                        <label
                            className="text-base font-medium text-neutral-900 dark:text-neutral-200 "
                        >On sale!</label>
                        <p className="text-neutral-500 dark:text-neutral-400  text-sm">
                            Products currently on sale
                        </p>
                    </div>
                    <label className="relative inline-block cursor-pointer switch">
                        <Switch checked={isOnSale} onChange={setIsOnSale} />
                    </label>
                
                </div>
            </div> */}
        </div>
    );
};

export default Filters;
