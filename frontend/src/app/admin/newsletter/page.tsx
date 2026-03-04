'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Download, UserX } from 'lucide-react';
import { newsletterApi } from '@/api/newsletter.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Badge from '@/components/admin/Badge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { formatUKDate } from '@/lib/formatDate';
import toast from 'react-hot-toast';

interface Subscriber {
  id: string; email: string; firstName?: string; lastName?: string;
  isActive: boolean; source?: string; createdAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [unsubscribeEmail, setUnsubscribeEmail] = useState<string | null>(null);
  const [unsubscribing, setUnsubscribing] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await newsletterApi.getAll({
        page, limit: 25,
        search: search || undefined,
        isActive: activeFilter !== '' ? activeFilter === 'true' : undefined,
      });
      setSubscribers(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
      setTotal(data.meta?.total ?? 0);
    } finally { setLoading(false); }
  }, [page, search, activeFilter]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleUnsubscribe = async () => {
    if (!unsubscribeEmail) return;
    setUnsubscribing(true);
    try {
      await newsletterApi.unsubscribe(unsubscribeEmail);
      toast.success('Subscriber removed');
      setUnsubscribeEmail(null);
      fetchSubscribers();
    } catch { toast.error('Failed to unsubscribe'); }
    finally { setUnsubscribing(false); }
  };

  const handleExportCSV = () => {
    const rows = subscribers.map((s) => `${s.email},${s.firstName || ''},${s.lastName || ''},${s.isActive},${s.createdAt}`);
    const csv = ['Email,First Name,Last Name,Active,Joined', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'email', header: 'Email', render: (row: Subscriber) => (
      <div>
        <p className="text-sm font-medium text-ink">{row.email}</p>
        {(row.firstName || row.lastName) && (
          <p className="text-xs text-ink-muted">{row.firstName} {row.lastName}</p>
        )}
      </div>
    )},
    { key: 'source', header: 'Source', render: (row: Subscriber) => (
      <span className="text-xs text-ink-muted capitalize">{row.source || '—'}</span>
    )},
    { key: 'isActive', header: 'Status', render: (row: Subscriber) => (
      <Badge label={row.isActive ? 'Subscribed' : 'Unsubscribed'} variant={row.isActive ? 'success' : 'default'} />
    )},
    { key: 'createdAt', header: 'Joined', render: (row: Subscriber) => (
      <span className="text-xs text-ink-muted">{formatUKDate(row.createdAt)}</span>
    )},
    { key: 'actions', header: '', render: (row: Subscriber) => row.isActive ? (
      <button onClick={(e) => { e.stopPropagation(); setUnsubscribeEmail(row.email); }}
        className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors">
        <UserX size={13} /> Remove
      </button>
    ) : null },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Newsletter Subscribers"
        subtitle={`${total.toLocaleString()} total subscribers`}
        action={
          <button onClick={handleExportCSV} className="btn-outline-gold h-9 px-4 text-sm flex items-center gap-2">
            <Download size={14} /> Export CSV
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search subscribers…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="input-base w-40 h-9 text-xs">
          <option value="">All</option>
          <option value="true">Subscribed</option>
          <option value="false">Unsubscribed</option>
        </select>
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={subscribers as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No subscribers found"
      />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{subscribers.length} shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!unsubscribeEmail}
        title="Remove Subscriber"
        message={`Unsubscribe ${unsubscribeEmail} from the newsletter?`}
        confirmLabel="Remove"
        variant="danger"
        loading={unsubscribing}
        onConfirm={handleUnsubscribe}
        onCancel={() => setUnsubscribeEmail(null)}
      />
    </div>
  );
}
