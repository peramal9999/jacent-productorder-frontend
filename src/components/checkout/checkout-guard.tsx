'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useIsMounted } from '@/utils/use-is-mounted';
import { ROUTES } from '@/utils/routes';

export const MIN_ORDER_AMOUNT = 250;

export default function CheckoutGuard() {
    const router = useRouter();
    const pathname = usePathname();
    const mounted = useIsMounted();
    const { total, isEmpty } = useCart();

    useEffect(() => {
        if (!mounted) return;
        // Only guard the checkout entry page itself. Once the user has
        // navigated away (e.g. to /checkout/order-confirmation after a
        // successful placeOrder which empties the cart), we must not bounce
        // them back to /cart.
        if (pathname !== ROUTES.CHECKOUT) return;
        if (isEmpty || total < MIN_ORDER_AMOUNT) {
            router.replace(ROUTES.CART as any);
        }
    }, [mounted, pathname, isEmpty, total, router]);

    return null;
}
