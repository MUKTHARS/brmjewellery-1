'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { userApi } from '@/api/user.api';
import { orderApi } from '@/api/order.api';
import PageHeader from '@/components/admin/PageHeader';
import Badge, { getOrderStatusVariant, getPaymentStatusVariant } from '@/components/admin/Badge';
import DataTable from '@/components/admin/DataTable';
import { formatUKDate, formatUKDateTime } from '@/lib/formatDate';
import { formatGBP } from '@/lib/formatCurrency';
import toast from 'react-hot-toast';

interface CustomerDetail {
  id: string; email: string; firstName: string; lastName: string;
  phone?: string; role: string; isActive: boolean;
  lastLoginAt?: string; createdAt: string;
  _count: { orders: number };
  addresses?: { id: string; line1: string; city: string; postcode: string; isDefault: boolean }[];
}

interface Order {
  id: string; orderNumber: string; totalAmountGBP: number;
  fulfillmentStatus: string; paymentStatus: string; createdAt: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, oRes] = await Promise.all([
          userApi.getById(id),
          orderApi.getAll({ userId: id, limit: 50, page: 1 }),
        ]);
        setCustomer(cRes.data.data);
        setRole(cRes.data.data.role);
        setIsActive(cRes.data.data.isActive);
        setOrders(oRes.data.data ?? []);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.update(id, { role, isActive });
      toast.success('Customer updated');
    } catch { toast.error('Failed to update customer'); }
    finally { setSaving(false); }
  };

  const orderColumns = [
    { key: 'orderNumber', header: 'Order #', render: (row: Order) => <span className="text-sm font-medium text-gold">{row.orderNumber}</span> },
    { key: 'createdAt', header: 'Date', render: (row: Order) => <span className="text-xs text-ink-muted">{formatUKDate(row.createdAt)}</span> },
    { key: 'total', header: 'Total', render: (row: Order) => <span className="text-sm tabular-nums">{formatGBP(row.totalAmountGBP)}</span> },
    { key: 'fulfillmentStatus', header: 'Fulfillment', render: (row: Order) => <Badge label={row.fulfillmentStatus} variant={getOrderStatusVariant(row.fulfillmentStatus)} /> },
    { key: 'paymentStatus', header: 'Payment', render: (row: Order) => <Badge label={row.paymentStatus} variant={getPaymentStatusVariant(row.paymentStatus)} /> },
  ];

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!customer) return (
    <div className="p-8"><p className="text-ink-muted">Customer not found.</p></div>
  );

  return (
    <div className="p-8 max-w-5xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Customers
      </button>

      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={`Customer since ${formatUKDate(customer.createdAt)}`}
        action={
          <button onClick={handleSave} disabled={saving} className="btn-gold h-9 px-5 text-sm">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-widest">Profile Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-ink-muted mb-1">First Name</p>
              <p className="text-ink font-medium">{customer.firstName}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1">Last Name</p>
              <p className="text-ink font-medium">{customer.lastName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-ink-muted" />
              <div>
                <p className="text-xs text-ink-muted mb-0.5">Email</p>
                <p className="text-ink">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-ink-muted" />
              <div>
                <p className="text-xs text-ink-muted mb-0.5">Phone</p>
                <p className="text-ink">{customer.phone || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1">Last Login</p>
              <p className="text-ink">{customer.lastLoginAt ? formatUKDateTime(customer.lastLoginAt) : 'Never'}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1">Total Orders</p>
              <p className="text-ink font-semibold tabular-nums">{customer._count.orders}</p>
            </div>
          </div>
        </div>

        {/* Management Card */}
        <div className="card p-6 space-y-5">
          <h3 className="text-sm font-semibold text-ink uppercase tracking-widest">Account Management</h3>

          <div>
            <label className="label-base mb-1.5 flex items-center gap-1.5">
              <Shield size={13} /> Role
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-base w-full h-9 text-sm">
              <option value="USER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
          </div>

          <div>
            <p className="label-base mb-1.5">Account Status</p>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors w-full ${
                isActive ? 'bg-success/10 text-success' : 'bg-gray-100 text-ink-muted'
              }`}
            >
              {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {isActive ? 'Active' : 'Inactive'}
            </button>
          </div>

          {customer.addresses && customer.addresses.length > 0 && (
            <div>
              <p className="label-base mb-2">Saved Addresses</p>
              <div className="space-y-2">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="text-xs text-ink-muted bg-cream rounded p-2">
                    {addr.line1}, {addr.city}, {addr.postcode}
                    {addr.isDefault && <span className="ml-1 text-gold font-medium">(default)</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div>
        <h3 className="text-sm font-semibold text-ink uppercase tracking-widest mb-4">Order History</h3>
        <DataTable
          columns={orderColumns as Parameters<typeof DataTable>[0]['columns']}
          data={orders as unknown as Record<string, unknown>[]}
          keyField="id"
          loading={false}
          emptyMessage="No orders yet"
          onRowClick={(row) => router.push(`/admin/orders/${(row as unknown as Order).id}`)}
        />
      </div>
    </div>
  );
}
