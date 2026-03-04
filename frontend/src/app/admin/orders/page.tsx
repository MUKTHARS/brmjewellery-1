'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download } from 'lucide-react';
import { orderApi } from '@/api/order.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Badge, { getOrderStatusVariant, getPaymentStatusVariant } from '@/components/admin/Badge';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate } from '@/lib/formatDate';
import { invoiceApi } from '@/api/invoice.api';
import toast from 'react-hot-toast';

interface Order {
  id: string; orderNumber: string; createdAt: string;
  totalGBP: number; fulfillmentStatus: string; paymentStatus: string;
  deliveryMethod: string;
  user: { firstName: string; lastName: string; email: string };
  invoice?: { pdfUrl: string } | null;
  shipment?: { trackingNumber: string; courier: string; status: string } | null;
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'FAILED', 'REFUNDED'];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderApi.getAll({
        page, limit: 20, search: search || undefined,
        status: statusFilter || undefined, paymentStatus: paymentFilter || undefined,
      });
      setOrders(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleDownloadInvoice = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      window.open(invoiceApi.downloadUrl(orderId), '_blank');
    } catch { toast.error('Invoice not available'); }
  };

  const columns = [
    { key: 'orderNumber', header: 'Order No.', render: (row: Order) => <span className="font-mono text-xs text-ink">{row.orderNumber}</span> },
    { key: 'customer', header: 'Customer', render: (row: Order) => (
      <div>
        <p className="text-sm text-ink">{row.user.firstName} {row.user.lastName}</p>
        <p className="text-xs text-ink-muted">{row.user.email}</p>
      </div>
    )},
    { key: 'createdAt', header: 'Date', render: (row: Order) => <span className="text-xs">{formatUKDate(row.createdAt)}</span> },
    { key: 'totalGBP', header: 'Total', render: (row: Order) => <span className="tabular-nums font-medium">{formatGBP(Number(row.totalGBP))}</span> },
    { key: 'fulfillmentStatus', header: 'Status', render: (row: Order) => <Badge label={row.fulfillmentStatus} variant={getOrderStatusVariant(row.fulfillmentStatus)} /> },
    { key: 'paymentStatus', header: 'Payment', render: (row: Order) => <Badge label={row.paymentStatus} variant={getPaymentStatusVariant(row.paymentStatus)} /> },
    { key: 'tracking', header: 'Tracking', render: (row: Order) => row.shipment ? (
      <span className="text-xs font-mono text-ink-muted">{row.shipment.trackingNumber}</span>
    ) : <span className="text-ink-muted text-xs">—</span> },
    { key: 'actions', header: '', render: (row: Order) => (
      row.invoice ? (
        <button onClick={(e) => handleDownloadInvoice(row.id, e)} className="p-1.5 text-ink-muted hover:text-gold transition-colors" title="Download invoice">
          <Download size={14} />
        </button>
      ) : null
    ), className: 'w-12' },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Orders" subtitle="Manage and track all customer orders" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search order number or customer…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-base w-44 h-9 text-xs">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="input-base w-36 h-9 text-xs">
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={orders as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No orders found"
        onRowClick={(row) => router.push(`/admin/orders/${(row as unknown as Order).id}`)}
      />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{orders.length} orders shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
