'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, FileText } from 'lucide-react';
import { userOrderApi } from '@/api/order.user.api';
import Badge, { getOrderStatusVariant, getPaymentStatusVariant } from '@/components/admin/Badge';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate, formatUKDateTime } from '@/lib/formatDate';

interface OrderDetail {
  id: string; orderNumber: string; totalGBP: number; subtotalGBP: number; vatGBP: number;
  shippingCostGBP: number; fulfillmentStatus: string; paymentStatus: string;
  createdAt: string; deliveryMethod: string; notes?: string;
  shippingAddress: { line1: string; line2?: string; city: string; county?: string; postcode: string };
  items: { id: string; productTitle: string; productSku: string; quantity: number; priceAtPurchaseGBP: number; product?: { images?: { url: string }[] } }[];
  shipment?: { courier: string; trackingNumber: string; status: string; estimatedDelivery?: string };
  invoice?: { invoiceNumber: string; pdfUrl: string };
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userOrderApi.getById(id).then(({ data }) => setOrder(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return <div className="text-sm text-ink-muted py-8">Order not found.</div>;

  const addr = order.shippingAddress;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-xs text-ink-muted hover:text-gold flex items-center gap-1 transition-colors">
          <ArrowLeft size={12} /> Orders
        </Link>
        <span className="text-ink-muted text-xs">/</span>
        <span className="text-xs text-gold font-medium">{order.orderNumber}</span>
      </div>

      {/* Status Banner */}
      <div className="border border-gold/10 p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-ink-muted mb-1">Placed on {formatUKDate(order.createdAt)}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge label={order.fulfillmentStatus} variant={getOrderStatusVariant(order.fulfillmentStatus)} />
            <Badge label={order.paymentStatus} variant={getPaymentStatusVariant(order.paymentStatus)} />
          </div>
        </div>
        {order.invoice && (
          <a href={order.invoice.pdfUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-gold hover:underline">
            <FileText size={13} /> {order.invoice.invoiceNumber}
          </a>
        )}
      </div>

      {/* Items */}
      <div className="border border-gold/10 p-5">
        <h3 className="text-xs uppercase tracking-widest text-ink mb-4">Items Ordered</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 flex-shrink-0 bg-cream overflow-hidden">
                {item.product?.images?.[0]?.url && <img src={item.product.images[0].url} alt={item.productTitle} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{item.productTitle}</p>
                <p className="text-xs text-ink-muted">{item.productSku} · Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium tabular-nums">{formatGBP(Number(item.priceAtPurchaseGBP) * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gold/10 mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{formatGBP(Number(order.subtotalGBP))}</span></div>
          <div className="flex justify-between text-ink-muted"><span>VAT (20%)</span><span>{formatGBP(Number(order.vatGBP))}</span></div>
          <div className="flex justify-between text-ink-muted"><span>Delivery</span><span>{Number(order.shippingCostGBP) === 0 ? 'FREE' : formatGBP(Number(order.shippingCostGBP))}</span></div>
          <div className="flex justify-between font-semibold pt-1.5 border-t border-gold/10 text-base">
            <span>Total</span><span>{formatGBP(Number(order.totalGBP))}</span>
          </div>
        </div>
      </div>

      {/* Delivery + Tracking */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-gold/10 p-5">
          <h3 className="text-xs uppercase tracking-widest text-ink mb-3 flex items-center gap-1.5"><Package size={12} /> Delivery Address</h3>
          <div className="text-sm text-ink-muted space-y-0.5">
            <p className="text-ink font-medium">{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city}{addr.county ? `, ${addr.county}` : ''}</p>
            <p>{addr.postcode}</p>
          </div>
          <p className="text-xs text-ink-muted mt-2">Method: {order.deliveryMethod}</p>
        </div>

        {order.shipment && (
          <div className="border border-gold/10 p-5">
            <h3 className="text-xs uppercase tracking-widest text-ink mb-3 flex items-center gap-1.5"><Truck size={12} /> Tracking</h3>
            <div className="text-sm space-y-1.5">
              <div><span className="text-ink-muted text-xs">Courier</span><p className="text-ink">{order.shipment.courier}</p></div>
              <div><span className="text-ink-muted text-xs">Tracking Number</span><p className="font-mono text-sm text-gold">{order.shipment.trackingNumber}</p></div>
              <div><span className="text-ink-muted text-xs">Status</span><p className="text-ink">{order.shipment.status}</p></div>
              {order.shipment.estimatedDelivery && (
                <div><span className="text-ink-muted text-xs">Estimated Delivery</span><p>{formatUKDate(order.shipment.estimatedDelivery)}</p></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
