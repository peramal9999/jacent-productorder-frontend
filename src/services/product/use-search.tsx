import { QueryOptionsType, Product } from '@/services/types';
import { useQuery } from '@tanstack/react-query';
import { API_RESOURCES } from '@/services/utils/api-endpoints';
import { products as localProducts } from '@/data/products-data';

const normalize = (v: string) => v.toLowerCase().replace(/[\s-]/g, '');

export const fetchSearched = async ({ queryKey }: any): Promise<Product[]> => {
    const options = queryKey[1];
    const text: string = (options?.text ?? '').toString();
    if (!text.trim()) return [];

    const q = text.toLowerCase().trim();
    const qCompact = normalize(text);

    return localProducts.filter((product) => {
        // Product ID match (exact or partial, e.g. "130" matches "13083")
        const id = String(product.id ?? '').toLowerCase();
        if (id && id.includes(q)) return true;

        const name = (product.name ?? '').toLowerCase();
        if (name.includes(q)) return true;

        // UPC may live on .sku, .upcCode, or nested under the product fields we added.
        const upcRaw =
            ((product as { upcCode?: string }).upcCode ??
                (product.sku as string | undefined) ??
                '');

        if (!upcRaw) return false;

        const upc = upcRaw.toLowerCase();
        // Direct match (with dashes) OR compact match (ignoring dashes/spaces)
        return upc.includes(q) || normalize(upc).includes(qCompact);
    });
};

export const useSearchQuery = (options: QueryOptionsType) => {
    return useQuery<Product[], Error>({
        queryKey: [API_RESOURCES.SEARCH, options],
        queryFn: fetchSearched,
    });
};
