"use client"

import React, {useMemo} from "react"
import {CategoriesFilter, type CategoryOption} from "@/components/filter/facets/categories-filter";
import {PriceRangeFilter} from "@/components/filter/facets/price-range-filter";
import {DollarSign, LayoutGrid, Tag, X} from "lucide-react"

import {FilterPopover} from "@/components/filter/facets/filter-popover";
import cn from "classnames";
import {colorMap} from "@/data/color-settings";
import {usePanel} from "@/hooks/use-panel";
import {useFilterControls} from "@/hooks/use-filter-hooks";
import {useFilterStore} from "@/stores/useFilterStore";
import {useGetFilterOptionsQuery} from "@/store/productsApi";


export default function HorizontalFilter() {
    const { selectedColor } = usePanel();
    const {
        isOnSale,
        setIsOnSale,
        selectedFilters,
        handleFilterChange,
        handlePriceChange,
        clearFilter,
        hasSelectedFilters,
        isPriceRangeSelected,
        getPriceRangeLabel,
        MIN_PRICE,
        MAX_PRICE,
    } = useFilterControls();
    const storeSelectedCategories = useFilterStore((s) => s.selectedCategories);
    const toggleCategory = useFilterStore((s) => s.toggleCategory);
    const clearCategories = useFilterStore((s) => s.clearCategories);
    const categoriesSelected = Object.values(storeSelectedCategories).some(Boolean);

    const {data: filterOptions} = useGetFilterOptionsQuery();
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
        <div className="w-full px-4 py-6 bg-gray-100 dark:bg-white rounded">
            <div className="flex items-center gap-5">
                <div className={"text-brand-dark"}>Filters</div>
                {/* Categories Filter */}
                <FilterPopover
                    label="Categories"
                    icon={<LayoutGrid className="h-4 w-4" />}
                    isSelected={categoriesSelected}
                    onClear={() => clearCategories()}
                >
                    <div className="mb-4">
                        <h3 className="font-semibold text-base  text-brand-dark">Categories</h3>
                    </div>
                    <CategoriesFilter
                        categories={categories}
                        selectedCategories={storeSelectedCategories}
                        onCategoryChange={(id, checked) => toggleCategory(id, checked)}
                    />
                </FilterPopover>
                
                {/* Price Range Filter */}
                <FilterPopover
                    label="Price"
                    selectedLabel={getPriceRangeLabel()}
                    icon={<DollarSign className="h-4 w-4" />}
                    isSelected={isPriceRangeSelected()}
                    onClear={() => clearFilter("price")}
                >
                    <div className="mb-4">
                        <h3 className="font-semibold text-base  text-brand-dark">Price Range</h3>
                    </div>
                    <PriceRangeFilter min={MIN_PRICE} max={MAX_PRICE} value={selectedFilters.price} onChange={handlePriceChange}/>
                </FilterPopover>
                
                {/* Colors Filter */}
                {/* <FilterPopover
                    label="Colors"
                    icon={<Palette className="h-4 w-4" />}
                    isSelected={hasSelectedFilters("colors")}
                    onClear={() => clearFilter("colors")}
                >
                    <div className="mb-4">
                        <h3 className="font-semibold text-base  text-brand-dark">Colors</h3>
                    </div>
                    <ColorsFilter
                        colors={colorsData}
                        selectedColors={selectedFilters.colors}
                        onColorChange={(id, checked) => handleFilterChange("colors", id, checked)}
                    />
                </FilterPopover> */}
                
                {/* Sizes Filter */}
                {/* <FilterPopover
                    label="Sizes"
                    icon={<Ruler className="h-4 w-4" />}
                    isSelected={hasSelectedFilters("sizes")}
                    onClear={() => clearFilter("sizes")}
                >
                    <div className="mb-4">
                        <h3 className="font-semibold text-base  text-brand-dark">Sizes</h3>
                    </div>
                    <SizesFilter
                        sizes={sizesData}
                        selectedSizes={selectedFilters.sizes}
                        onSizeChange={(id, checked) => handleFilterChange("sizes", id, checked)}
                    />
                </FilterPopover> */}
                
                
                {/* On Sale Toggle */}
                <button className={cn(
                    "bg-white flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-500",
                    isOnSale
                        ? `bg-blue-50  ${colorMap[selectedColor].border}`
                        : "border-neutral-300 dark:border-neutral-700",
                )}
                        onClick={() => setIsOnSale(!isOnSale)}
                >
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">On sale</span>
                    {isOnSale && (
                            <span
                                className={` flex-shrink-0 w-4 h-4 rounded-full text-brand-light flex items-center justify-center cursor-pointer ${colorMap[selectedColor].bg}`}>
                            <X className="h-3 w-3 "/>
                            </span>
                        )}
                </button>
            
            
            </div>
        </div>
    )
}




