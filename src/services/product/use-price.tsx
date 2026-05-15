import { useMemo } from 'react';

const currencyFormatterCache = new Map<string, Intl.NumberFormat>();
const percentFormatterCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(locale: string, currencyCode: string): Intl.NumberFormat {
  const key = `${locale}:${currencyCode}`;
  let formatter = currencyFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode });
    currencyFormatterCache.set(key, formatter);
  }
  return formatter;
}

function getPercentFormatter(locale: string): Intl.NumberFormat {
  let formatter = percentFormatterCache.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'percent' });
    percentFormatterCache.set(locale, formatter);
  }
  return formatter;
}

// Basic price formatting function
export function formatPrice({
                              amount,
                              currencyCode,
                              locale,
                            }: {
  amount: number;
  currencyCode: string;
  locale: string;
}): string {
  return getCurrencyFormatter(locale, currencyCode).format(amount);
}

// Variant price formatting with discount calculation
export function formatVariantPrice({
                                     amount,
                                     baseAmount,
                                     currencyCode,
                                     locale,
                                   }: {
  baseAmount: number;
  amount: number;
  currencyCode: string;
  locale: string;
}): {
  price: string;
  basePrice: string | null;
  discount: string | null;
} {
  const hasDiscount = baseAmount > amount;
  const discount = hasDiscount
      ? getPercentFormatter(locale).format((baseAmount - amount) / baseAmount)
      : null;
  
  const price = formatPrice({ amount, currencyCode, locale });
  const basePrice = hasDiscount
      ? formatPrice({ amount: baseAmount, currencyCode, locale })
      : null;
  
  return { price, basePrice, discount };
}

// Price hook with proper return type
export default function usePrice(
    data?: {
      amount: number;
      baseAmount?: number;
      currencyCode: string;
    } | null
): {
  price: string;
  basePrice: string | null;
  discount: string | null;
} {
  const { amount, baseAmount, currencyCode } = data ?? {};
  const locale = 'en';
  
  const value = useMemo(() => {
    if (typeof amount !== 'number' || !currencyCode) return '';
    
    return baseAmount !== undefined
        ? formatVariantPrice({ amount, baseAmount, currencyCode, locale })
        : formatPrice({ amount, currencyCode, locale });
  }, [amount, baseAmount, currencyCode]);
  
  return typeof value === 'string'
      ? { price: value, basePrice: null, discount: null }
      : value;
}