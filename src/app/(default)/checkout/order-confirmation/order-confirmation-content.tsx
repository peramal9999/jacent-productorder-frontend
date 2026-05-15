'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderInformation from '@/components/orders/order-information';
import Container from '@/components/shared/container';
import Loading from '@/components/shared/loading';

function ConfirmationInner() {
    const params = useSearchParams();
    const orderId = params.get('orderId') ?? undefined;
    return <OrderInformation orderId={orderId} />;
}

export default function OrderConfirmationContent() {
    return (
        <Container>
            <Suspense fallback={<Loading />}>
                <ConfirmationInner />
            </Suspense>
        </Container>
    );
}
