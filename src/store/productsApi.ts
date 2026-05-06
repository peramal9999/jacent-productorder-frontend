import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/services/api/axiosConfig';
import type { Product } from '@/services/types';

/**
 * Pagination wrapper that mirrors a typical Spring Boot Page<T>.
 * Some backends return `content`, others use `data`/`items`. We accept
 * any of them and surface them as `content` to callers.
 */
export interface ProductsPage {
    content: Product[];
    totalElements?: number;
    totalPages?: number;
    pageNumber?: number;
    pageSize?: number;
    [key: string]: unknown;
}

type RawProductsResponse =
    | Product[]
    | (Partial<ProductsPage> & {
          data?: Product[];
          items?: Product[];
      });

const normaliseProducts = (raw: RawProductsResponse): ProductsPage => {
    if (Array.isArray(raw)) {
        return { content: raw, totalElements: raw.length };
    }
    const content = raw.content ?? raw.data ?? raw.items ?? [];
    return { ...raw, content };
};

export interface GetAllProductsArgs {
    pageNo?: number;
    pageSize?: number;
}

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: axiosBaseQuery(),
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getAllProducts: builder.query<ProductsPage, GetAllProductsArgs | void>({
            query: (args) => ({
                url: '/v1/products',
                method: 'GET',
                params: {
                    pageNo: args?.pageNo ?? 0,
                    pageSize: args?.pageSize ?? 20,
                },
            }),
            transformResponse: (response: RawProductsResponse) =>
                normaliseProducts(response),
            providesTags: ['Products'],
        }),
    }),
});

export const { useGetAllProductsQuery } = productsApi;
