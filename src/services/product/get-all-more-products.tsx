import { QueryOptionsType, PaginatedProduct } from '@/services/types';
import { useInfiniteQuery, QueryKey, InfiniteData, QueryFunctionContext } from '@tanstack/react-query';
import shuffle from 'lodash/shuffle';
import { products as localProducts } from '@/data/products-data';

const fetchProducts = async ({
    queryKey,
    pageParam = 1,
}: QueryFunctionContext<QueryKey, number>): Promise<PaginatedProduct> => {
    const [, options] = queryKey as ['load-products', QueryOptionsType];
    const { limit = 10, sort_by, categories } = options;

    let data = [...localProducts];

    // Filter by selected category ids (from filter store).
    // If "all" is selected or no selection, return all products.
    if (categories && categories.length > 0 && !categories.includes('all')) {
        data = data.filter((product) =>
            product.category.some((c) =>
                categories.includes((c.slug ?? '').toLowerCase()),
            ),
        );
    }

    // Sort
    if (sort_by === 'price') {
        data = [...data].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort_by === 'name') {
        data = [...data].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort_by === 'new-arrival') {
        // Preserve original order (newest-first from data file).
    } else {
        data = shuffle(data);
    }

    const startIndex = (pageParam - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
        data: paginatedData,
        paginatorInfo: {
            nextPage: endIndex < data.length ? pageParam + 1 : null,
            total: data.length,
        },
    };
};

const useMoreProductsQuery = (options: QueryOptionsType) => {
    return useInfiniteQuery<PaginatedProduct, Error, InfiniteData<PaginatedProduct, number>, QueryKey, number>({
        queryKey: ['load-products', options],
        queryFn: fetchProducts,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.paginatorInfo.nextPage,
    });
};

export { useMoreProductsQuery, fetchProducts };
