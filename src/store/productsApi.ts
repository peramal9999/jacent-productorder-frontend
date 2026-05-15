import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/services/api/axiosConfig';
import type { Product } from '@/services/types';

/**
 * Raw item shape returned by `GET /v1/items`.
 * Most fields are optional / nullable in the upstream catalogue.
 */
export interface ItemDTO {
    itemId: number | string;
    itemExtId?: string | null;
    itemName?: string | null;
    itemDesc?: string | null;
    commodity?: string | null;
    division?: string | null;
    divisionId?: number | null;
    divName?: string | null;
    upcCode?: string | null;
    upc?: string | null;
    saleUnit?: string | null;
    price?: number | null;
    retailPrice?: number | null;
    mvid?: string | null;
    rank?: number | null;
    orderRank?: number | null;
    [key: string]: unknown;
}

export interface ItemsPage {
    content: ItemDTO[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    [key: string]: unknown;
}

export interface ProductsPage {
    content: Product[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

/**
 * Map a raw catalogue item into the `Product` shape that the existing
 * product cards / cart already understand.  We treat `retailPrice` as the
 * displayed strike-through price and `price` as the (already-discounted)
 * sell price, matching how `ProductCard` uses `sale_price` + `price`.
 */
const itemToProduct = (item: ItemDTO): Product => {
    const sell = Number(item.price ?? 0);
    const list = Number(item.retailPrice ?? sell);
    const commoditySlug = item.commodity ? String(item.commodity) : '';
    return {
        id: item.itemId,
        name: item.itemDesc ?? item.itemName ?? `Item ${item.itemId}`,
        slug: String(item.itemId),
        price: list,
        sale_price: sell < list ? sell : undefined,
        quantity: 0,
        sold: 0,
        videoUrl: '',
        variation_options: [],
        // No image data on this endpoint; the card falls back to a placeholder.
        image: undefined as unknown as Product['image'],
        sku: item.itemName ?? undefined,
        upcCode: item.upcCode ?? undefined,
        category: commoditySlug
            ? [
                  {
                      id: Number(item.commodity) || 0,
                      name: commoditySlug,
                      slug: commoditySlug.toLowerCase(),
                  },
              ]
            : [],
        brand: item.divName ?? '',
        rating: 0,
        discountPercentage:
            list > 0 && sell < list
                ? Math.round(((list - sell) / list) * 100)
                : 0,
        weight: 0,
        // Surface raw catalogue fields for downstream code that reads them.
        commodity: item.commodity,
        division: item.division,
        retailPrice: list,
    } as unknown as Product;
};

const normaliseItems = (raw: unknown): ProductsPage => {
    const page = (raw ?? {}) as Partial<ItemsPage> & {
        data?: ItemDTO[];
        items?: ItemDTO[];
    };
    const rawContent: ItemDTO[] = Array.isArray(raw)
        ? (raw as ItemDTO[])
        : page.content ?? page.data ?? page.items ?? [];
    return {
        content: rawContent.map(itemToProduct),
        pageNo: page.pageNo ?? 0,
        pageSize: page.pageSize ?? rawContent.length,
        totalElements: page.totalElements ?? rawContent.length,
        totalPages: page.totalPages ?? 1,
    };
};

export interface GetAllProductsArgs {
    pageSize?: number;
    /** Optional commodity ids to filter by (server-side). */
    commodityIds?: Array<number | string>;
    /** Optional commodity names that align 1:1 with `commodityIds`. */
    commodities?: string[];
    /** Optional inclusive price range. Pass 0/0 (default) to skip filtering. */
    priceRangeMin?: number;
    priceRangeMax?: number;
    sortBy?: string;
}

export interface GetProductsPageArgs extends GetAllProductsArgs {
    pageNo?: number;
}

export interface CommodityDTO {
    commodity: string;
    commodityId: number;
}

export interface DivisionDTO {
    division: string;
    divisionNameId: number;
    divname: string;
}

export interface FilterOptions {
    commodities: CommodityDTO[];
    divisions: DivisionDTO[];
    location?: Record<string, unknown>;
    store?: Record<string, unknown>;
}

/**
 * Build the request descriptor for `/v1/items`.
 *
 * - No category selected → `GET /v1/items?pageNo=&pageSize=` (only those
 *   two params, as specified by the backend).
 * - One or more categories selected → `POST /v1/items` with the full
 *   filter body: { pageNo, pageSize, commodityIds, priceRangeMin,
 *   priceRangeMax }. `sortBy`, when present, rides on the query string
 *   since it isn't part of the documented body shape.
 */
const buildItemsRequest = (args: {
    pageNo: number;
    pageSize: number;
    commodityIds?: Array<number | string>;
    commodities?: string[];
    priceRangeMin?: number;
    priceRangeMax?: number;
    sortBy?: string;
}) => {
    const hasCategoryFilter = !!(args.commodityIds && args.commodityIds.length);
    const hasPriceFilter =
        (args.priceRangeMin ?? 0) > 0 || (args.priceRangeMax ?? 0) > 0;
    if (!hasCategoryFilter && !hasPriceFilter) {
        return {
            url: '/v1/items',
            method: 'GET' as const,
            params: { pageNo: args.pageNo, pageSize: args.pageSize },
        };
    }
    return {
        url: '/v1/items',
        method: 'POST' as const,
        ...(args.sortBy ? { params: { sortBy: args.sortBy } } : {}),
        data: {
            pageNo: args.pageNo,
            pageSize: args.pageSize,
            commodityIds: (args.commodityIds ?? []).map((id) => Number(id)),
            commodities: args.commodities ?? [],
            priceRangeMin: args.priceRangeMin ?? 0,
            priceRangeMax: args.priceRangeMax ?? 0,
        },
    };
};

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Products', 'FilterOptions'],
    endpoints: (builder) => ({
        /**
         * Single-page catalogue listing. Backed by `/v1/items`. See
         * `buildItemsRequest` for the GET vs POST switch.
         */
        getProductsPage: builder.query<ProductsPage, GetProductsPageArgs | void>({
            query: (args) =>
                buildItemsRequest({
                    pageNo: args?.pageNo ?? 0,
                    pageSize: args?.pageSize ?? 25,
                    commodityIds: args?.commodityIds,
                    commodities: args?.commodities,
                    priceRangeMin: args?.priceRangeMin,
                    priceRangeMax: args?.priceRangeMax,
                    sortBy: args?.sortBy,
                }),
            transformResponse: (response: unknown) => normaliseItems(response),
            providesTags: ['Products'],
        }),

        /**
         * Filter / facet metadata for the catalogue. Backed by
         * `GET /api/v1/filterOptions`. We surface `commodities` as
         * the category list shown on the home / category page.
         */
        getFilterOptions: builder.query<FilterOptions, void>({
            query: () => ({ url: '/v1/filterOptions', method: 'GET' }),
            providesTags: ['FilterOptions'],
        }),

        /**
         * Free-text catalogue search. Backed by
         * `GET /api/v1/items/search?searchString=...`.
         * Caller is responsible for only firing this when the search
         * string is meaningful (≥ 3 characters).
         */
        searchItems: builder.query<Product[], string>({
            query: (searchString) => ({
                url: '/v1/items/search',
                method: 'GET',
                params: { searchString },
            }),
            transformResponse: (response: unknown) =>
                normaliseItems(response).content,
        }),
    }),
});

export const {
    useGetProductsPageQuery,
    useGetFilterOptionsQuery,
    useSearchItemsQuery,
} = productsApi;
