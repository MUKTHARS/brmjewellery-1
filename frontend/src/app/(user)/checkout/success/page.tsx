'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { userOrderApi } from '@/api/order.user.api';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate } from '@/lib/formatDate';

interface Order {
  id: string; orderNumber: string; totalGBP: number; createdAt: string;
  fulfillmentStatus: string; items: { id: string; productTitle: string; quantity: number; priceAtPurchaseGBP: number }[];
}

function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      userOrderApi.getById(orderId).then(({ data }) => setOrder(data.data)).catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={32} className="text-success" />
      </div>

      <h1 className="font-cormorant text-4xl font-light text-ink mb-2">Order Confirmed</h1>
      <p className="text-ink-muted mb-8">Thank you for your purchase. A confirmation email is on its way.</p>

      {order ? (
        <div className="border border-gold/10 p-6 text-left mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-widest">Order Number</p>
              <p className="font-medium text-gold text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-muted">{formatUKDate(order.createdAt)}</p>
              <p className="text-sm font-semibold tabular-nums mt-1">{formatGBP(Number(order.totalGBP))}</p>
            </div>
          </div>
          <div className="space-y-2 border-t border-gold/10 pt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-ink">{item.productTitle} <span className="text-ink-muted">×{item.quantity}</span></span>
                <span className="tabular-nums">{formatGBP(Number(item.priceAtPurchaseGBP) * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-gold/10 p-6 mb-8 flex items-center gap-3">
          <Package size={20} className="text-gold" />
          <p className="text-sm text-ink-muted">Your order is being processed and will be confirmed shortly.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/orders" className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-sm">
          Track My Order <ArrowRight size={14} />
        </Link>
        <Link href="/products" className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 text-sm">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPageWrapper() {
  return <Suspense fallback={null}><OrderSuccessPage /></Suspense>;
}
