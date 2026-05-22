'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { bespokeApi } from '@/api/bespoke.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Badge, { getBespokeStatusVariant } from '@/components/admin/Badge';
import { formatUKDate } from '@/lib/formatDate';
import { formatGBP } from '@/lib/formatCurrency';

interface Enquiry {
  id: string; name: string; email: string; phone?: string;
  metalType: string; carat: string; description: string;
  budgetGBP?: number; status: string; createdAt: string;
  quotedPriceGBP?: number;
  user?: { firstName: string; lastName: string };
}

const STATUS_OPTIONS = ['', 'NEW', 'IN_REVIEW', 'QUOTED', 'CONFIRMED', 'COMPLETED'];

export default function EnquiriesPage() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bespokeApi.getAll({ page, limit: 25, search: search || undefined, status: statusFilter || undefined });
      setEnquiries(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const columns = [
    { key: 'name', header: 'Customer', render: (row: Enquiry) => (
      <div>
        <p className="text-sm font-medium text-ink">{row.name}</p>
        <p className="text-xs text-ink-muted">{row.email}</p>
      </div>
    )},
    { key: 'metalType', header: 'Metal', render: (row: Enquiry) => (
      <span className="text-xs text-ink-muted">{row.metalType} {row.carat}</span>
    )},
    { key: 'budgetGBP', header: 'Budget', render: (row: Enquiry) => (
      <span className="text-sm tabular-nums">{row.budgetGBP ? formatGBP(row.budgetGBP) : '—'}</span>
    )},
    { key: 'quotedPriceGBP', header: 'Quoted', render: (row: Enquiry) => (
      <span className="text-sm tabular-nums text-gold">{row.quotedPriceGBP ? formatGBP(row.quotedPriceGBP) : '—'}</span>
    )},
    { key: 'status', header: 'Status', render: (row: Enquiry) => <Badge label={row.status} variant={getBespokeStatusVariant(row.status)} /> },
    { key: 'createdAt', header: 'Received', render: (row: Enquiry) => <span className="text-xs text-ink-muted">{formatUKDate(row.createdAt)}</span> },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Bespoke Enquiries" subtitle="Manage custom jewellery enquiries" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search by name or email…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-base w-40 h-9 text-xs">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ') || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns as unknown as Parameters<typeof DataTable>[0]['columns']}
        data={enquiries as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No enquiries found"
        onRowClick={(row) => router.push(`/admin/enquiries/${(row as unknown as Enquiry).id}`)}
      />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{enquiries.length} enquiries shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
