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
    commodityId?: Array<number | string>;
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
 * - With no commodity filter: plain GET, pageNo / pageSize on the
 *   query string.
 * - With one or more selected commodities: POST, the filter and
 *   paging info travel in the JSON body so we don't bloat the URL
 *   when many commodity ids are selected.
 */
const buildItemsRequest = (args: {
    pageNo: number;
    pageSize: number;
    commodityId?: Array<number | string>;
    sortBy?: string;
}) => {
    const hasFilter = !!(args.commodityId && args.commodityId.length);
    const pageNo = args.pageNo;
    const pageSize = args.pageSize;
    if (hasFilter) {
        return {
            url: '/v1/items',
            method: 'POST' as const,
            data: {
                pageNo,
                pageSize,
                commodityId: args.commodityId,
                ...(args.sortBy ? { sortBy: args.sortBy } : {}),
            },
        };
    }
    return {
        url: '/v1/items',
        method: 'GET' as const,
        params: {
            pageNo,
            pageSize,
            ...(args.sortBy ? { sortBy: args.sortBy } : {}),
        },
    };
};

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Products', 'FilterOptions'],
    endpoints: (builder) => ({
        /**
         * Paginated catalogue listing. Backed by `/api/v1/items`.
         * - GET `/v1/items?pageNo=&pageSize=` for the unfiltered home
         *   page load.
         * - POST `/v1/items` (filter + paging in body) when the user
         *   has selected one or more categories.
         */
        getAllProducts: builder.infiniteQuery<
            ProductsPage,
            GetAllProductsArgs | void,
            number
        >({
            infiniteQueryOptions: {
                initialPageParam: 0,
                getNextPageParam: (lastPage, _allPages, lastPageParam) =>
                    lastPageParam + 1 < (lastPage.totalPages ?? 0)
                        ? lastPageParam + 1
                        : undefined,
            },
            query: ({ pageParam, queryArg }) =>
                buildItemsRequest({
                    pageNo: pageParam,
                    pageSize: queryArg?.pageSize ?? 20,
                    commodityId: queryArg?.commodityId,
                    sortBy: queryArg?.sortBy,
                }),
            transformResponse: (response: unknown) => normaliseItems(response),
            providesTags: ['Products'],
        }),

        /**
         * Single-page listing variant of `getAllProducts`. Use this when
         * the UI wants explicit pagination controls (page numbers /
         * page-size selector) instead of an infinite "load more" stream.
         * Same GET-vs-POST rule applies based on whether commodity
         * filters are active.
         */
        getProductsPage: builder.query<ProductsPage, GetProductsPageArgs | void>({
            query: (args) =>
                buildItemsRequest({
                    pageNo: args?.pageNo ?? 0,
                    pageSize: args?.pageSize ?? 20,
                    commodityId: args?.commodityId,
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
    }),
});

export const {
    useGetAllProductsInfiniteQuery,
    useGetProductsPageQuery,
    useGetFilterOptionsQuery,
} = productsApi;
