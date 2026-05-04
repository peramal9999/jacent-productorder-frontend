import OrderDetailContent from './order-detail-content';

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <OrderDetailContent orderId={id} />;
}
