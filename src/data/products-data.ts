import type { Product } from '@/services/types';

export type LocalProduct = {
    id: string;
    division: string;
    category: string;
    name: string;
    upcCode: string;
    saleUnit: number;
    price: number;
    retailPrice: number;
    /** Inventory available. 0 = out of stock. */
    stockLevel: number;
    /** Customer's internal item code (separate from UPC / vendor SKU). */
    customerItemCode?: string;
    /** Marks the product as a top seller within its category. */
    isTopSeller?: boolean;
    note?: string;
};

export const rawProducts: LocalProduct[] = [
    // CE-KROGER
    { id: '13083', division: 'CE-KROGER', category: 'BABY', name: 'JAMMI BIBS 3PK', upcCode: '8-18123-01131-1', saleUnit: 2, price: 3.99, retailPrice: 8.49, stockLevel: 142, customerItemCode: 'CL-13083', isTopSeller: true },
    { id: '14756', division: 'CE-KROGER', category: 'BABY', name: 'WASHCLOTHS 6CT CRIB', upcCode: '0-94606-03530-6', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 0, customerItemCode: 'CL-14756' },
    { id: '24239', division: 'CE-KROGER', category: 'BARWARE', name: 'STOPPERS SILICONE 4CT TB', upcCode: '6-37118-12206-7', saleUnit: 2, price: 3.75, retailPrice: 7.99, stockLevel: 56, customerItemCode: 'CL-24239', isTopSeller: true },
    { id: '24240', division: 'CE-KROGER', category: 'BARWARE', name: 'ICE TRAY SILICONE COCKTAIL TB', upcCode: '6-37118-12098-8', saleUnit: 2, price: 4.23, retailPrice: 8.99, stockLevel: 9, customerItemCode: 'CL-24240' },
    { id: '24247', division: 'CE-KROGER', category: 'BARWARE', name: 'CORKSCREW WAITERS GOLD TB', upcCode: '6-37118-12087-2', saleUnit: 2, price: 4.7, retailPrice: 9.99, stockLevel: 78, customerItemCode: 'CL-24247' },
    { id: '50780', division: 'CE-KROGER', category: 'FOOD STORAGE', name: 'CONDIMNT CUPS PLA 24CT BSM', upcCode: '6-37118-12345-3', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 220, customerItemCode: 'CL-50780', isTopSeller: true },
    { id: '62465', division: 'CE-KROGER', category: 'FOOD STORAGE', name: 'CONDMNT CUPS 2OZ COLOR 50CT CE', upcCode: '6-37118-12567-9', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 64, customerItemCode: 'CL-62465' },
    { id: '65933', division: 'CE-KROGER', category: 'FOOD STORAGE', name: 'WRAP BEESWAX 3CT BSM', upcCode: '6-37118-13613-2', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 0, customerItemCode: 'CL-65933' },
    { id: '21491', division: 'CE-KROGER', category: 'HARDWARE', name: 'ALL WEATHER TIRE BRUSH', upcCode: '0-37604-02072-1', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 32, customerItemCode: 'CL-21491' },
    { id: '20214', division: 'CE-KROGER', category: 'HARDWARE', name: 'TAPE MEASURE 25FT KC', upcCode: '6-37118-11159-7', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 117, customerItemCode: 'CL-20214', isTopSeller: true },
    { id: '21469', division: 'CE-KROGER', category: 'HARDWARE', name: 'CABLE TIES VELCRO', upcCode: '0-37604-02053-0', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 4, customerItemCode: 'CL-21469' },
    // LOBLAWS CONVENTIONAL
    { id: '16499', division: 'LOBLAWS CONVENTIONAL', category: 'LOCO', name: 'BAG CLIP MAGNETIC 7CT CE', upcCode: '6-37118-10451-3', saleUnit: 2, price: 3.45, retailPrice: 5.79, stockLevel: 89, customerItemCode: 'CL-16499', isTopSeller: true },
    { id: '16500', division: 'LOBLAWS CONVENTIONAL', category: 'LOCO', name: 'BAG CLIP SOFTGRIP 4CT CE', upcCode: '8-52755-00575-1', saleUnit: 2, price: 2.74, retailPrice: 4.69, stockLevel: 45, customerItemCode: 'CL-16500' },
    { id: '73017', division: 'LOBLAWS CONVENTIONAL', category: 'BABY', name: 'DIAPER DISPOSAL BAGS 72CT', upcCode: '6-37118-13770-2', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 12, customerItemCode: 'CL-73017' },
    { id: '73013', division: 'LOBLAWS CONVENTIONAL', category: 'BABY', name: 'BOTTLE CLEANER W/ SUCTION CUP', upcCode: '6-37118-13766-5', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 200, customerItemCode: 'CL-73013' },
    { id: '68659', division: 'LOBLAWS CONVENTIONAL', category: 'BABY', name: 'FOXII SILICONE CORNER GUARDS QUARK', upcCode: '6-28055-09803-4', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 0, customerItemCode: 'CL-68659' },
    { id: '19993', division: 'LOBLAWS CONVENTIONAL', category: 'CLEANING', name: 'MICROFIBER SCRUB CLOTHS 2CT KC', upcCode: '6-37118-11057-6', saleUnit: 2, price: 0, retailPrice: 0, stockLevel: 73, customerItemCode: 'CL-19993', note: '.' },
    { id: '19994', division: 'LOBLAWS CONVENTIONAL', category: 'CLEANING', name: 'MICROFIBER DUST CLOTHS 3CT KC', upcCode: '6-37118-11053-8', saleUnit: 2, price: 3.02, retailPrice: 4.99, stockLevel: 191, customerItemCode: 'CL-19994', isTopSeller: true },
    { id: '51070', division: 'LOBLAWS CONVENTIONAL', category: 'CLEANING', name: 'BOTTLE BRUSH KC', upcCode: '6-37118-12443-6', saleUnit: 2, price: 4.2, retailPrice: 6.99, stockLevel: 27, customerItemCode: 'CL-51070' },
];

export const categories = ['All', 'BABY', 'BARWARE', 'CLEANING', 'FOOD STORAGE', 'HARDWARE', 'LOCO'];

export function getProductImageUrl(id: string): string {
    return `https://jsmitemimage.s3.us-east-2.amazonaws.com/${id}.jpg`;
}

const categoryToSlug = (label: string): string =>
    label.toLowerCase().replace(/\s+/g, '-');

export const products: Product[] = rawProducts.map((p, idx) => {
    const displayPrice = p.retailPrice > 0 ? p.retailPrice : p.price;
    const salePrice =
        p.price > 0 && p.retailPrice > 0 && p.price < p.retailPrice ? p.price : undefined;
    const imageUrl = getProductImageUrl(p.id);

    return {
        id: p.id,
        name: p.name,
        slug: p.id,
        price: displayPrice,
        sale_price: salePrice,
        // The cart treats this field as available "stock". Use a generous
        // ceiling so an in-stock item can be ordered in any reasonable qty.
        // The actual on-hand quantity is exposed via `stockLevel` below.
        quantity: p.stockLevel > 0 ? 9999 : 0,
        sold: 0,
        videoUrl: '',
        variation_options: [],
        image: {
            id: p.id,
            thumbnail: imageUrl,
            original: imageUrl,
            original2: imageUrl,
        },
        category: [
            {
                id: idx,
                name: p.category,
                slug: categoryToSlug(p.category),
            },
        ],
        brand: p.division,
        sku: p.upcCode,
        description: `${p.division} · UPC ${p.upcCode} · Sale unit: ${p.saleUnit}`,
        rating: 0,
        discountPercentage: 0,
        weight: 0,
        upcCode: p.upcCode,
        division: p.division,
        saleUnit: p.saleUnit,
        retailPrice: p.retailPrice,
        stockLevel: p.stockLevel,
        customerItemCode: p.customerItemCode,
        isTopSeller: p.isTopSeller ?? false,
    } as Product;
});

export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
    if (!category || category.toLowerCase() === 'all') return products;
    const slug = categoryToSlug(category);
    return products.filter((p) =>
        p.category.some(
            (c) =>
                c.slug === slug ||
                c.name?.toLowerCase() === category.toLowerCase(),
        ),
    );
}

export function searchProducts(query: string): Product[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
        (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.category?.[0]?.name?.toLowerCase().includes(q) ?? false) ||
            (p.brand?.toLowerCase().includes(q) ?? false) ||
            ((p.sku as string | undefined)?.toLowerCase().includes(q) ?? false),
    );
}
