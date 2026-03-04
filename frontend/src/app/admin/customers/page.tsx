'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { userApi } from '@/api/user.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Badge from '@/components/admin/Badge';
import { formatUKDate } from '@/lib/formatDate';

interface Customer {
  id: string; email: string; firstName: string; lastName: string;
  phone?: string; role: string; isActive: boolean;
  lastLoginAt?: string; createdAt: string;
  _count: { orders: number };
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('USER');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userApi.getAll({ page, limit: 25, search: search || undefined, role: roleFilter || undefined });
      setCustomers(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const columns = [
    { key: 'name', header: 'Customer', render: (row: Customer) => (
      <div>
        <p className="text-sm font-medium text-ink">{row.firstName} {row.lastName}</p>
        <p className="text-xs text-ink-muted">{row.email}</p>
      </div>
    )},
    { key: 'phone', header: 'Phone', render: (row: Customer) => <span className="text-xs text-ink-muted">{row.phone || '—'}</span> },
    { key: 'orders', header: 'Orders', render: (row: Customer) => <span className="text-sm tabular-nums">{row._count.orders}</span> },
    { key: 'role', header: 'Role', render: (row: Customer) => <Badge label={row.role} variant={row.role === 'USER' ? 'default' : 'gold'} /> },
    { key: 'isActive', header: 'Status', render: (row: Customer) => <Badge label={row.isActive ? 'Active' : 'Inactive'} variant={row.isActive ? 'success' : 'default'} /> },
    { key: 'lastLoginAt', header: 'Last Login', render: (row: Customer) => <span className="text-xs text-ink-muted">{row.lastLoginAt ? formatUKDate(row.lastLoginAt) : 'Never'}</span> },
    { key: 'createdAt', header: 'Joined', render: (row: Customer) => <span className="text-xs text-ink-muted">{formatUKDate(row.createdAt)}</span> },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Customers" subtitle="View and manage customer accounts" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search customers…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-base w-36 h-9 text-xs">
          <option value="">All Roles</option>
          <option value="USER">Customers</option>
          <option value="ADMIN">Admins</option>
          <option value="SUPERADMIN">Super Admins</option>
        </select>
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={customers as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No customers found"
        onRowClick={(row) => router.push(`/admin/customers/${(row as unknown as Customer).id}`)}
      />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{customers.length} customers shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
