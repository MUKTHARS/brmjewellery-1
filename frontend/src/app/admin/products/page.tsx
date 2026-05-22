'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { productApi } from '@/api/product.api';
import { categoryApi } from '@/api/category.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Badge from '@/components/admin/Badge';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate } from '@/lib/formatDate';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/resolveImageUrl';


type Product = {
  id: string; title: string; slug: string; sku: string;
  baseCost: number; isActive: boolean; stockQty: number;
  metalType: string | null; carat: string | null;
  category: { name: string }; createdAt: string;
  images: Array<{ url: string; isPrimary: boolean }>;
};

interface Category { id: string; name: string; }

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({
        page, limit: 20, search: search || undefined,
        categoryId: categoryFilter || undefined,
        isActive: statusFilter || undefined,
      });
      setProducts(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    categoryApi.getAll(true).then(({ data }) => setCategories(data.data));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productApi.delete(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch { toast.error('Failed to delete product'); }
  };

  const columns = [
    {
      key: 'image', header: '',
      render: (row: Product) => {
        const img = row.images.find((i) => i.isPrimary) || row.images[0];
        return img ? (
          <div className="w-10 h-10 bg-cream border border-gray-100 overflow-hidden">
            <img src={resolveImageUrl(img.url)} alt={row.title} className="w-full h-full object-cover" />
          </div>
        ) : <div className="w-10 h-10 bg-cream border border-gray-100" />;
      },
      className: 'w-14',
    },
    {
      key: 'title', header: 'Product',
      render: (row: Product) => (
        <div>
          <p className="text-sm font-medium text-ink">{row.title}</p>
          <p className="text-xs text-ink-muted">{row.sku}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (row: Product) => <span className="text-sm">{row.category.name}</span> },
    {
      key: 'metal', header: 'Metal',
      render: (row: Product) => row.metalType ? (
        <span className="text-sm">{row.metalType}{row.carat ? ` · ${row.carat}` : ''}</span>
      ) : <span className="text-ink-muted">—</span>,
    },
    { key: 'baseCost', header: 'Base Cost', render: (row: Product) => <span className="tabular-nums">{formatGBP(Number(row.baseCost))}</span> },
    { key: 'stockQty', header: 'Stock', render: (row: Product) => <span className={row.stockQty <= 5 ? 'text-danger font-medium' : ''}>{row.stockQty}</span> },
    {
      key: 'isActive', header: 'Status',
      render: (row: Product) => <Badge label={row.isActive ? 'Active' : 'Inactive'} variant={row.isActive ? 'success' : 'default'} />,
    },
    { key: 'createdAt', header: 'Added', render: (row: Product) => <span className="text-xs">{formatUKDate(row.createdAt)}</span> },
    {
      key: 'actions', header: '',
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/products/${row.id}`); }}
            className="p-1.5 text-ink-muted hover:text-gold transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1.5 text-ink-muted hover:text-danger transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      className: 'w-20',
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Products"
        subtitle={`Manage your jewellery catalogue`}
        action={
          <Link href="/admin/products/new" className="btn-gold flex items-center gap-2 text-xs">
            <Plus size={14} /> Add Product
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text" placeholder="Search products or SKU…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="input-base w-44 h-9 text-xs">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-base w-36 h-9 text-xs">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <DataTable<Product>
        columns={columns} data={products}
        keyField="id" loading={loading}
        onRowClick={(row) => router.push(`/admin/products/${row.id}`)}
      />

      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{products.length} products shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
