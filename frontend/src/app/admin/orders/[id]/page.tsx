'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, Package, RefreshCw } from 'lucide-react';
import { orderApi } from '@/api/order.api';
import { invoiceApi } from '@/api/invoice.api';
import { paymentApi } from '@/api/payment.api';
import PageHeader from '@/components/admin/PageHeader';
import Badge, { getOrderStatusVariant, getPaymentStatusVariant } from '@/components/admin/Badge';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate, formatUKDateTime } from '@/lib/formatDate';
import toast from 'react-hot-toast';

interface OrderDetail {
  id: string; orderNumber: string; createdAt: string;
  subtotalGBP: number; vatGBP: number; shippingCostGBP: number; totalGBP: number;
  fulfillmentStatus: string; paymentStatus: string; deliveryMethod: string; notes?: string;
  shippingAddress: { line1: string; line2?: string; city: string; county?: string; postcode: string; country: string; fullName?: string };
  user: { id: string; firstName: string; lastName: string; email: string; phone?: string };
  items: Array<{ id: string; quantity: number; priceAtPurchaseGBP: number; productTitle: string; productSku: string; metalType?: string; carat?: string }>;
  invoice?: { id: string; pdfUrl: string; invoiceNumber: string } | null;
  shipment?: { courier: string; trackingNumber: string; status: string; estimatedDelivery?: string } | null;
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    orderApi.getById(id as string).then(({ data }) => {
      setOrder(data.data);
      setNewStatus(data.data.fulfillmentStatus);
      setNotes(data.data.notes || '');
      setLoading(false);
    }).catch(() => { toast.error('Order not found'); router.push('/admin/orders'); });
  }, [id, router]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const { data } = await orderApi.updateStatus(order.id, { fulfillmentStatus: newStatus, notes });
      setOrder(data.data);
      toast.success('Order updated');
    } catch { toast.error('Failed to update order'); }
    finally { setSaving(false); }
  };

  const handleRefund = async () => {
    if (!order) return;
    if (!confirm('Process a full refund for this order?')) return;
    try {
      await paymentApi.refund(order.id);
      toast.success('Refund processed');
      const { data } = await orderApi.getById(order.id);
      setOrder(data.data);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Refund failed');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;
    try {
      await invoiceApi.generate(order.id);
      const { data } = await orderApi.getById(order.id);
      setOrder(data.data);
      toast.success('Invoice generated');
    } catch { toast.error('Failed to generate invoice'); }
  };

  if (loading || !order) return <div className="p-8 animate-pulse"><div className="h-8 w-64 bg-gray-100 rounded" /></div>;

  const addr = order.shippingAddress;

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={formatUKDateTime(order.createdAt)}
        action={
          <button onClick={() => router.back()} className="btn-ghost flex items-center gap-2 text-xs">
            <ArrowLeft size={14} /> Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-cormorant text-lg font-light text-ink">Items</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex justify-between items-start">
                  <div>
                    <p className="text-sm text-ink font-medium">{item.productTitle}</p>
                    <p className="text-xs text-ink-muted">{item.productSku}{item.metalType ? ` · ${item.metalType}${item.carat ? ` ${item.carat}` : ''}` : ''}</p>
                    <p className="text-xs text-ink-muted mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm tabular-nums font-medium">{formatGBP(Number(item.priceAtPurchaseGBP) * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-cream border-t border-gray-100 space-y-1.5">
              <div className="flex justify-between text-sm text-ink-muted"><span>Subtotal</span><span className="tabular-nums">{formatGBP(Number(order.subtotalGBP))}</span></div>
              <div className="flex justify-between text-sm text-ink-muted"><span>Shipping</span><span className="tabular-nums">{Number(order.shippingCostGBP) === 0 ? 'FREE' : formatGBP(Number(order.shippingCostGBP))}</span></div>
              <div className="flex justify-between text-sm text-ink-muted"><span>VAT (20%)</span><span className="tabular-nums">{formatGBP(Number(order.vatGBP))}</span></div>
              <div className="flex justify-between text-base font-medium text-ink border-t border-gray-200 pt-2 mt-1">
                <span>Total</span><span className="tabular-nums text-gold">{formatGBP(Number(order.totalGBP))}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Shipping Address</h3>
            <div className="text-sm text-ink-muted leading-relaxed">
              {addr.fullName && <p className="text-ink font-medium">{addr.fullName}</p>}
              <p>{addr.line1}</p>
              {addr.line2 && <p>{addr.line2}</p>}
              <p>{addr.city}{addr.county ? `, ${addr.county}` : ''}</p>
              <p>{addr.postcode}</p>
              <p>{addr.country}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-ink-muted">Delivery method: <span className="text-ink">{order.deliveryMethod}</span></p>
            </div>
            {order.shipment && (
              <div className="mt-3 p-3 bg-cream border border-gray-100">
                <p className="text-xs text-ink-muted">Courier: <span className="text-ink font-medium">{order.shipment.courier}</span></p>
                <p className="text-xs text-ink-muted">Tracking: <span className="font-mono text-ink">{order.shipment.trackingNumber}</span></p>
                <Badge label={order.shipment.status} variant="info" className="mt-1.5" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-4">Order Status</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge label={order.fulfillmentStatus} variant={getOrderStatusVariant(order.fulfillmentStatus)} />
                <Badge label={order.paymentStatus} variant={getPaymentStatusVariant(order.paymentStatus)} />
              </div>
              <div>
                <label className="label-base">Update Status</label>
                <select className="input-base" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">Notes</label>
                <textarea rows={3} className="input-base resize-none text-xs" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes…" />
              </div>
              <button onClick={handleUpdateStatus} disabled={saving} className="w-full btn-gold text-xs">
                <Package size={12} className="inline mr-1.5" />
                {saving ? 'Saving…' : 'Update Order'}
              </button>
            </div>
          </div>

          {/* Customer */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-3">Customer</h3>
            <p className="text-sm text-ink font-medium">{order.user.firstName} {order.user.lastName}</p>
            <p className="text-xs text-ink-muted">{order.user.email}</p>
            {order.user.phone && <p className="text-xs text-ink-muted">{order.user.phone}</p>}
            <button onClick={() => router.push(`/admin/customers/${order.user.id}`)}
              className="text-xs text-gold hover:text-gold-dark mt-2 block">View customer →</button>
          </div>

          {/* Invoice */}
          <div className="card p-6">
            <h3 className="font-cormorant text-lg font-light text-ink mb-3">Invoice</h3>
            {order.invoice ? (
              <>
                <p className="text-xs text-ink-muted mb-3">{order.invoice.invoiceNumber}</p>
                <a href={invoiceApi.downloadUrl(order.id)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-xs btn-outline-gold w-full justify-center py-2">
                  <Download size={12} /> Download PDF
                </a>
              </>
            ) : (
              <button onClick={handleGenerateInvoice} className="w-full btn-outline-gold text-xs py-2">
                Generate Invoice
              </button>
            )}
          </div>

          {/* Refund */}
          {order.paymentStatus === 'PAID' && (
            <button onClick={handleRefund} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-danger text-danger text-xs hover:bg-danger hover:text-white transition-colors">
              <RefreshCw size={12} /> Process Full Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
