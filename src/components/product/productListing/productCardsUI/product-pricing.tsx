import React from "react";
import cn from "classnames";
import usePrice from "@/services/product/use-price";
import { Product } from "@/services/types";
import { usePanel } from "@/hooks/use-panel";
import { colorMap } from "@/data/color-settings";

interface ProductPricingProps {
    product: Product;
    variant?: string;
}

const ProductPricing: React.FC<ProductPricingProps> = ({ product, variant = "default"}) => {
    const { product_type, sale_price, price, min_price, max_price } = product;
    const { selectedColor } = usePanel();
    const { price: displayPrice, basePrice } = usePrice({
        amount: sale_price ? sale_price : price,
        baseAmount: price,
        currencyCode: "USD",
    });
    const { price: minPrice } = usePrice({
        amount: min_price ?? 0,
        currencyCode: "USD",
    });
    const { price: maxPrice } = usePrice({
        amount: max_price ?? 0,
        currencyCode: "USD",
    });

    return (
        <div className={cn("flex items-baseline gap-2", {
            "mt-2 mb-2": variant === "default" || variant === "large" || variant === "outBorder" || variant === "furni"|| variant === "cardList",
            "mt-3 mb-3": variant === "list" || variant === "bestdeal",
        })}>
          <span
              className={cn(colorMap[selectedColor].text, "font-bold text-base md:text-lg", {
                  "text-[18px]": variant === "list" || variant === "bestdeal",
                  "sm:text-brand-dark": variant === "furni" || variant === "outBorder"|| variant === "cardList",
              })}
          >
            {product_type === "variable"
                ? `${minPrice} - ${maxPrice}`
                : displayPrice}
          </span>
            {basePrice && (
                <del className="text-sm text-gray-400">{basePrice}</del>
            )}
        </div>
    );
};

export default ProductPricing;