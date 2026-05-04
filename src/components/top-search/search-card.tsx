import Image from '@/components/shared/image';
import Link from '@/components/shared/link';
import { ROUTES } from '@/utils/routes';
import { searchProductPlaceholder } from '@/assets/placeholders';
import usePrice from '@/services/product/use-price';
import { usePanel } from '@/hooks/use-panel';
import { colorMap } from '@/data/color-settings';
import cn from 'classnames';
import AddToCart from '@/components/product/add-to-cart';
import type { Product } from '@/services/types';

type SearchProductProps = {
    product: Product | any;
    onAddedToCart?: () => void;
};

const SearchCard: React.FC<SearchProductProps> = ({ product, onAddedToCart }) => {
    const { name, image, product_type } = product ?? {};
    const { price, basePrice } = usePrice({
        amount: product?.sale_price ? product?.sale_price : product?.price,
        baseAmount: product?.price,
        currencyCode: 'USD',
    });
    const { price: minPrice } = usePrice({
        amount: product?.min_price ?? 0,
        currencyCode: 'USD',
    });
    const { price: maxPrice } = usePrice({
        amount: product?.max_price ?? 0,
        currencyCode: 'USD',
    });

    const { selectedColor } = usePanel();

    const upcCode =
        (product as { upcCode?: string })?.upcCode ??
        (product?.sku as string | undefined) ??
        '';

    return (
        <div className="flex items-center justify-start w-full h-auto group gap-3">
            <Link
                href={`${ROUTES.PRODUCT}/${product?.slug}`}
                className="flex items-center flex-1 min-w-0"
            >
                <div className="relative flex w-20 rounded-md overflow-hidden flex-shrink-0 cursor-pointer me-4">
                    <Image
                        src={image?.thumbnail ?? searchProductPlaceholder}
                        width={70}
                        height={70}
                        alt={name || 'Product Image'}
                        className="object-cover bg-fill-thumbnail"
                    />
                </div>

                <div className="flex flex-col overflow-hidden min-w-0">
                    <h3 className="truncate text-brand-dark text-15px mb-1">
                        {name}
                    </h3>
                    {upcCode && (
                        <p className="truncate text-[11px] text-gray-500 font-mono mb-1">
                            UPC: {upcCode}
                        </p>
                    )}
                    <div className="space-x-2">
                        <span
                            className={cn(
                                'inline-block font-semibold text-sm sm:text-15px lg:text-base',
                                colorMap[selectedColor].text,
                            )}
                        >
                            {product_type === 'variable'
                                ? `${minPrice} - ${maxPrice}`
                                : price}
                        </span>
                        {basePrice && (
                            <del className="text-sm text-brand-dark text-opacity-70">
                                {basePrice}
                            </del>
                        )}
                    </div>
                </div>
            </Link>

            <div
                className="shrink-0"
                onClick={(e) => {
                    // Prevent the parent row's onClick (which clears/closes the
                    // search dropdown) from firing before the add-to-cart action runs.
                    e.stopPropagation();
                    onAddedToCart?.();
                }}
            >
                <AddToCart
                    data={product}
                    variant="dark"
                    className="!min-w-0 !px-3 !py-1.5 !text-[12px]"
                />
            </div>
        </div>
    );
};

export default SearchCard;
