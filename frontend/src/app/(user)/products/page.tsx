'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi } from '@/api/product.api';
import { categoryApi } from '@/api/category.api';
import ProductCard from '@/components/user/ProductCard';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface Product {
  id: string; slug: string; title: string; baseCost: number;
  metalType?: string; carat?: string; isActive: boolean;
  images?: { url: string }[]; category?: { id: string; name: string };
}
interface Category { id: string; name: string; slug: string }

const METAL_TYPES = ['GOLD', 'SILVER', 'PLATINUM'];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [metalType, setMetalType] = useState(searchParams.get('metalType') || '');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    categoryApi.getAll({ isActive: true }).then(({ data }) => setCategories(data.data ?? []));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getAll({
        page, limit: 12, isActive: 'true',
        search: search || undefined,
        categoryId: categoryId || undefined,
        metalType: metalType || undefined,
      });
      setProducts(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, categoryId, metalType]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleAddToCart = (p: Product) => {
    addItem({ productId: p.id, title: p.title, price: Number(p.baseCost), imageUrl: p.images?.[0]?.url, sku: p.slug, metalType: p.metalType, carat: p.carat ?? undefined, quantity: 1 });
    toast.success(`${p.title} added to bag`);
  };

  const resetFilters = () => { setSearch(''); setCategoryId(''); setMetalType(''); setPage(1); };
  const hasFilters = search || categoryId || metalType;

  const Skeleton = () => (
    <div className="space-y-3">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold text-xs uppercase tracking-widest mb-1">Our Collection</p>
        <div className="flex items-end justify-between">
          <h1 className="font-cormorant text-4xl font-light text-ink">All Jewellery</h1>
          <p className="text-sm text-ink-muted">{total} pieces</p>
        </div>
        <div className="w-16 h-px bg-gold mt-4" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-ink mb-3">Category</h3>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => { setCategoryId(''); setPage(1); }}
                  className={`text-sm transition-colors ${!categoryId ? 'text-gold font-medium' : 'text-ink-muted hover:text-ink'}`}>
                  All Collections
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button onClick={() => { setCategoryId(c.id); setPage(1); }}
                    className={`text-sm transition-colors ${categoryId === c.id ? 'text-gold font-medium' : 'text-ink-muted hover:text-ink'}`}>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-ink mb-3">Metal Type</h3>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => { setMetalType(''); setPage(1); }}
                  className={`text-sm transition-colors ${!metalType ? 'text-gold font-medium' : 'text-ink-muted hover:text-ink'}`}>
                  All Metals
                </button>
              </li>
              {METAL_TYPES.map((m) => (
                <li key={m}>
                  <button onClick={() => { setMetalType(m); setPage(1); }}
                    className={`text-sm capitalize transition-colors ${metalType === m ? 'text-gold font-medium' : 'text-ink-muted hover:text-ink'}`}>
                    {m.charAt(0) + m.slice(1).toLowerCase()}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-danger hover:text-danger/70 transition-colors">
              <X size={12} /> Clear filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search + mobile filter */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input type="text" placeholder="Search jewellery…"
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-base pl-8 h-10 text-sm w-full" />
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 px-4 h-10 border border-gold/20 text-sm text-ink hover:border-gold transition-colors">
              <SlidersHorizontal size={14} /> Filters
              {hasFilters && <span className="w-1.5 h-1.5 bg-gold rounded-full" />}
            </button>
          </div>

          {/* Mobile Filters */}
          {filtersOpen && (
            <div className="lg:hidden border border-gold/10 p-4 mb-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink mb-2">Category</p>
                <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }} className="input-base w-full h-8 text-xs">
                  <option value="">All</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink mb-2">Metal</p>
                <select value={metalType} onChange={(e) => { setMetalType(e.target.value); setPage(1); }} className="input-base w-full h-8 text-xs">
                  <option value="">All</option>
                  {METAL_TYPES.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-cormorant text-2xl text-ink/30 mb-3">No pieces found</p>
              <button onClick={resetFilters} className="text-sm text-gold hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p.id} id={p.id} slug={p.slug} title={p.title}
                  price={Number(p.baseCost)} imageUrl={p.images?.[0]?.url}
                  metalType={p.metalType ?? undefined} carat={p.carat ?? undefined}
                  category={p.category?.name}
                  onAddToCart={() => handleAddToCart(p)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 text-sm transition-colors ${page === i + 1 ? 'bg-gold text-white' : 'border border-gold/20 text-ink hover:border-gold'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
