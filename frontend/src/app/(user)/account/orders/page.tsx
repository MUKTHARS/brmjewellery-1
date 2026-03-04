'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { userOrderApi } from '@/api/order.user.api';
import Badge, { getOrderStatusVariant, getPaymentStatusVariant } from '@/components/admin/Badge';
import { formatUKDate } from '@/lib/formatDate';
import { formatGBP } from '@/lib/formatCurrency';

interface Order {
  id: string; orderNumber: string; totalGBP: number; fulfillmentStatus: string;
  paymentStatus: string; createdAt: string;
  items: { id: string; productTitle: string; quantity: number }[];
  shipment?: { trackingNumber: string; courier: string; status: string };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userOrderApi.getAll().then(({ data }) => setOrders(data.data ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-cream animate-pulse rounded" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="border border-gold/10 p-12 text-center">
      <Package size={36} className="text-gold/20 mx-auto mb-3" />
      <p className="text-sm text-ink-muted mb-4">You haven't placed any orders yet</p>
      <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-6 py-2.5 text-sm">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="space-y-3">
      <h2 className="text-xs uppercase tracking-widest text-ink mb-4">Order History</h2>
      {orders.map((order) => (
        <Link key={order.id} href={`/account/orders/${order.id}`}
          className="flex items-center gap-4 border border-gold/10 p-4 hover:border-gold/30 transition-colors group">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1.5">
              <span className="text-sm font-medium text-gold">{order.orderNumber}</span>
              <Badge label={order.fulfillmentStatus} variant={getOrderStatusVariant(order.fulfillmentStatus)} />
              <Badge label={order.paymentStatus} variant={getPaymentStatusVariant(order.paymentStatus)} />
            </div>
            <p className="text-xs text-ink-muted">
              {order.items.slice(0, 2).map((i) => `${i.productTitle} ×${i.quantity}`).join(', ')}
              {order.items.length > 2 && ` +${order.items.length - 2} more`}
            </p>
            <p className="text-xs text-ink-muted mt-1">{formatUKDate(order.createdAt)}</p>
            {order.shipment && (
              <p className="text-xs text-ink-muted mt-0.5">
                {order.shipment.courier} · {order.shipment.trackingNumber}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0 flex items-center gap-3">
            <p className="text-sm font-semibold tabular-nums">{formatGBP(Number(order.totalGBP))}</p>
            <ChevronRight size={16} className="text-ink-muted group-hover:text-gold transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
