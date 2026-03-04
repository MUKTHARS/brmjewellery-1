'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { reviewApi } from '@/api/review.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Badge from '@/components/admin/Badge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { formatUKDate } from '@/lib/formatDate';
import toast from 'react-hot-toast';

interface Review {
  id: string; rating: number; title?: string; body?: string;
  isVisible: boolean; isVerifiedPurchase: boolean; createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  product: { title: string; sku: string };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [visibleFilter, setVisibleFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reviewApi.getAll({
        page, limit: 25,
        search: search || undefined,
        isVisible: visibleFilter !== '' ? visibleFilter === 'true' : undefined,
      });
      setReviews(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, visibleFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await reviewApi.toggleVisibility(id);
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, isVisible: !current } : r));
      toast.success(current ? 'Review hidden' : 'Review published');
    } catch { toast.error('Failed to update review'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await reviewApi.delete(deleteId);
      toast.success('Review deleted');
      setDeleteId(null);
      fetchReviews();
    } catch { toast.error('Failed to delete review'); }
    finally { setDeleting(false); }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? 'text-gold fill-gold' : 'text-gray-300'} />
      ))}
    </div>
  );

  const columns = [
    { key: 'product', header: 'Product', render: (row: Review) => (
      <div>
        <p className="text-sm font-medium text-ink line-clamp-1">{row.product.title}</p>
        <p className="text-xs text-ink-muted">{row.product.sku}</p>
      </div>
    )},
    { key: 'user', header: 'Customer', render: (row: Review) => (
      <div>
        <p className="text-sm text-ink">{row.user.firstName} {row.user.lastName}</p>
        <p className="text-xs text-ink-muted">{row.user.email}</p>
      </div>
    )},
    { key: 'rating', header: 'Rating', render: (row: Review) => (
      <div className="space-y-0.5">
        <StarRating rating={row.rating} />
        {row.title && <p className="text-xs font-medium text-ink">{row.title}</p>}
      </div>
    )},
    { key: 'body', header: 'Review', render: (row: Review) => (
      <p className="text-xs text-ink-muted line-clamp-2 max-w-xs">{row.body || '—'}</p>
    )},
    { key: 'isVerifiedPurchase', header: 'Verified', render: (row: Review) => (
      <Badge label={row.isVerifiedPurchase ? 'Verified' : 'Unverified'} variant={row.isVerifiedPurchase ? 'success' : 'default'} />
    )},
    { key: 'isVisible', header: 'Visibility', render: (row: Review) => (
      <Badge label={row.isVisible ? 'Visible' : 'Hidden'} variant={row.isVisible ? 'gold' : 'default'} />
    )},
    { key: 'createdAt', header: 'Date', render: (row: Review) => <span className="text-xs text-ink-muted">{formatUKDate(row.createdAt)}</span> },
    { key: 'actions', header: '', render: (row: Review) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => handleToggleVisibility(row.id, row.isVisible)}
          className="p-1.5 rounded hover:bg-cream transition-colors text-ink-muted hover:text-ink"
          title={row.isVisible ? 'Hide' : 'Show'}>
          {row.isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button onClick={() => setDeleteId(row.id)}
          className="p-1.5 rounded hover:bg-danger/10 transition-colors text-ink-muted hover:text-danger"
          title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="p-8">
      <PageHeader title="Reviews" subtitle="Manage product reviews and ratings" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search reviews…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={visibleFilter} onChange={(e) => { setVisibleFilter(e.target.value); setPage(1); }}
          className="input-base w-36 h-9 text-xs">
          <option value="">All Reviews</option>
          <option value="true">Visible Only</option>
          <option value="false">Hidden Only</option>
        </select>
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={reviews as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No reviews found"
      />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{reviews.length} reviews shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Review"
        message="This will permanently delete the review. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
