import React, {useMemo} from "react";
import cn from "classnames";
import Image from "@/components/shared/image";
import { Product } from "@/services/types";
import { productPlaceholder } from "@/assets/placeholders";
import SearchIcon from "@/components/icons/search-icon";
import {useModal} from "@/hooks/use-modal";
import { usePanel } from "@/hooks/use-panel";
import { colorMap } from "@/data/color-settings";
import usePrice from "@/services/product/use-price";

interface ProductImageProps {
    product: Product;
    outOfStock: boolean;
    variant?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ product, outOfStock,variant="default" }) => {
    const { image, name, sale_price, price } = product;
    const { openModal } = useModal();
    const { selectedColor } = usePanel();
    const { discount } = usePrice({
        amount: sale_price ? sale_price : price,
        baseAmount: price,
        currencyCode: "USD",
    });
    
    const handlePopupView = () => {
        openModal("PRODUCT_VIEW", product);
    };
    
    const imgSize = useMemo(() => {
        switch (variant) {
            case 'list':
                return 280;
            case 'bestdeal':
            case 'furni':
                return 300;
            default:
                return 200;
        }
    }, [variant]);

    const imageSrc = `https://jsmitemimage.s3.us-east-2.amazonaws.com/${product.id}.jpg`;

    
    return (
        <div className={cn("relative flex-shrink-0  z-1")}>

            <div
                className={cn(
                    "flex justify-center card-img-container overflow-hidden w-full aspect-square",
                    variant === "list" && "rounded-md border border-black/10"
                )}
            >
                <Image
                    src={imageSrc}
                    alt={name || "Product Image"}
                    width={imgSize}
                    height={imgSize}
                    className="object-contain w-full h-full transition-transform duration-200 group-hover:scale-[1.03]"
                />
            </div>
            <div className="w-full h-full absolute top-1 z-10 flex flex-wrap items-start gap-1 px-1">
                <span className="text-[10px] font-medium text-brand-light uppercase inline-block bg-teal-500 rounded-sm px-2.5 pt-1 pb-[3px]">
                    {product.id}
                </span>

                {/* Top seller flag (from product data) */}
                {/* {(product as { isTopSeller?: boolean }).isTopSeller && (
                    <span className="text-[10px] font-semibold text-brand-light uppercase inline-flex items-center gap-1 bg-amber-500 rounded-sm px-2 pt-1 pb-[3px]">
                        ★ Top seller
                    </span>
                )} */}

                {/* Out-of-stock from inventory data (not just cart state) */}
                {/* {((product as { stockLevel?: number }).stockLevel === 0 || outOfStock) && (
                    <span className="text-[10px] font-medium text-brand-light uppercase inline-block bg-brand-dark rounded-sm px-2.5 pt-1 pb-[3px]">
                        Out of Stock
                    </span>
                )} */}
            </div>
            
        </div>
    );
};

export default ProductImage;