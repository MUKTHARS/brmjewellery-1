'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { categoryApi } from '@/api/category.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Badge from '@/components/admin/Badge';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Category {
  id: string; name: string; slug: string; description?: string;
  isActive: boolean; sortOrder: number; parent?: { name: string } | null;
  _count: { products: number };
  attributeTemplate?: { attributes: unknown[] } | null;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.getAll(true);
      setCategories(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryApi.delete(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Cannot delete this category');
    }
  };

  const columns = [
    { key: 'name', header: 'Category', render: (row: Category) => (
      <div>
        <p className="text-sm font-medium text-ink">{row.name}</p>
        <p className="text-xs text-ink-muted">{row.slug}</p>
      </div>
    )},
    { key: 'parent', header: 'Parent', render: (row: Category) => <span className="text-sm">{row.parent?.name || '—'}</span> },
    { key: 'products', header: 'Products', render: (row: Category) => <span className="text-sm tabular-nums">{row._count.products}</span> },
    { key: 'attrs', header: 'Attributes', render: (row: Category) => (
      <span className="text-sm tabular-nums text-ink-muted">
        {(row.attributeTemplate?.attributes as unknown[])?.length || 0} fields
      </span>
    )},
    { key: 'isActive', header: 'Status', render: (row: Category) => (
      <Badge label={row.isActive ? 'Active' : 'Inactive'} variant={row.isActive ? 'success' : 'default'} />
    )},
    { key: 'actions', header: '', render: (row: Category) => (
      <div className="flex items-center gap-1">
        <Link href={`/admin/categories/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-ink-muted hover:text-gold transition-colors" title="Edit">
          <Pencil size={14} />
        </Link>
        <Link href={`/admin/categories/${row.id}?tab=attributes`}
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-ink-muted hover:text-blue-600 transition-colors" title="Manage attributes">
          <Settings size={14} />
        </Link>
        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
          disabled={row._count.products > 0}
          className="p-1.5 text-ink-muted hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    ), className: 'w-24' },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Categories"
        subtitle="Manage jewellery categories and their attribute templates"
        action={
          <Link href="/admin/categories/new" className="btn-gold flex items-center gap-2 text-xs">
            <Plus size={14} /> Add Category
          </Link>
        }
      />
      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={categories as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No categories yet"
        onRowClick={(row) => router.push(`/admin/categories/${(row as unknown as Category).id}`)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete" variant="danger"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
