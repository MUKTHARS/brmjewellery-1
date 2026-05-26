'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, ChevronDown, ChevronUp, SlidersHorizontal, ArrowRight, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { productApi } from '@/api/product.api';
import { categoryApi } from '@/api/category.api';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatGBP } from '@/lib/formatCurrency';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

interface Product {
  id: string; slug: string; title: string; baseCost: number;
  metalType?: string; metalColor?: string; carat?: string;
  gemstone?: string; diamondShape?: string;
  brand?: string; weightGrams?: number; isActive: boolean;
  images?: { url: string }[]; category?: { id: string; name: string };
}

// Maps UI label → API metalType value (GOLD/SILVER/PLATINUM)
const METAL_TYPE_MAP: Record<string, string> = {
  'Yellow Gold': 'GOLD',
  'White Gold':  'GOLD',
  'Rose Gold':   'GOLD',
  'Silver':      'SILVER',
  'Platinum':    'PLATINUM',
};
interface Category { id: string; name: string; slug: string }

const METAL_TYPES = ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'];
const METAL_SWATCHES: Record<string, string> = {
  'Yellow Gold': '#C9A84C',
  'White Gold':  '#E8E8E8',
  'Rose Gold':   '#E8B4A0',
  'Silver':      '#C0C0C0',
  'Platinum':    '#8E9093',
};
const CARATS = ['9ct', '14ct', '18ct', '22ct', '24ct'];
const GEMSTONES = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Pearl', 'Amethyst', 'Aquamarine', 'Opal', 'Garnet', 'Topaz'];
const DIAMOND_SHAPES = ['Round', 'Princess', 'Oval', 'Marquise', 'Pear', 'Cushion', 'Emerald Cut', 'Radiant', 'Asscher', 'Heart'];
const WEIGHT_RANGES = [
  { label: 'Under 5g', min: 0, max: 5 },
  { label: '5g – 15g', min: 5, max: 15 },
  { label: '15g – 30g', min: 15, max: 30 },
  { label: '30g – 50g', min: 30, max: 50 },
  { label: '50g+', min: 50, max: Infinity },
];
const PRICE_RANGES = [
  { label: 'Under £500', min: 0, max: 500 },
  { label: '£500 – £1,000', min: 500, max: 1000 },
  { label: '£1,000 – £2,500', min: 1000, max: 2500 },
  { label: '£2,500 – £5,000', min: 2500, max: 5000 },
  { label: '£5,000+', min: 5000, max: Infinity },
];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A – Z' },
  { value: 'name-desc', label: 'Name: Z – A' },
];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '20px', marginBottom: '20px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: open ? '14px' : 0,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: '#1A1A1A' }}>
          {title}
        </span>
        {open ? <ChevronUp size={13} color="#444444" /> : <ChevronDown size={13} color="#444444" />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function CheckItem({
  label,
  active,
  onClick,
  radio = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  radio?: boolean;
}) {
  return (
    <li style={{ listStyle: 'none' }}>
      <button
        onClick={onClick}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span style={{
          width: '14px', height: '14px', flexShrink: 0,
          border: `1px solid ${active ? '#C9A84C' : '#ccc'}`,
          backgroundColor: active ? '#C9A84C' : 'transparent',
          borderRadius: radio ? '50%' : '0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {active && (
            <span style={{
              width: '6px', height: '6px', backgroundColor: '#fff',
              borderRadius: radio ? '50%' : '0',
            }} />
          )}
        </span>
        <span style={{ fontSize: '13px', color: active ? '#C9A84C' : '#444444' }}>{label}</span>
      </button>
    </li>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      backgroundColor: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
      color: '#C9A84C', padding: '3px 8px', fontSize: '10px', letterSpacing: '0.1em',
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#C9A84C', display: 'flex' }}>
        <X size={9} />
      </button>
    </span>
  );
}

function ProductCardLuxury({ product: p, onAddToCart }: { product: Product; onAddToCart: () => void }) {
  const [hovered, setHovered] = useState(false);
  const imageUrl = p.images?.[0]?.url ? resolveImageUrl(p.images[0].url) : null;
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const wishlisted = isWishlisted(p.id);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push('/login?redirect=/wishlist'); return; }
    toggle({ productId: p.id, slug: p.slug, title: p.title, price: Number(p.baseCost), imageUrl: p.images?.[0]?.url, metalType: p.metalType ?? undefined, carat: p.carat ?? undefined, category: p.category?.name });
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  }

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: '#f5f5f2', marginBottom: '14px' }}>
        {imageUrl ? (
          <Link href={`/products/${p.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
            <img
              src={imageUrl}
              alt={p.title}
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                transition: 'transform 0.6s ease',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
            />
          </Link>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 300, color: 'rgba(201,168,76,0.25)' }}>BRM</span>
          </div>
        )}

        {/* Dark overlay on hover */}
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.16)',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none',
        }} />

        {/* Add to bag — slides up */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          transform: hovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s ease',
        }}>
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(); }}
            style={{
              width: '100%', backgroundColor: '#1A1A1A', color: '#fff',
              padding: '12px', fontSize: '9px', letterSpacing: '0.25em',
              textTransform: 'uppercase', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#C9A84C')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A1A1A')}
          >
            <ShoppingBag size={12} /> ADD TO BAG
          </button>
        </div>

        {/* Category badge */}
        {p.category?.name && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(255,255,255,0.92)',
            padding: '3px 8px', fontSize: '8px', letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#444444',
          }}>
            {p.category.name}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            backgroundColor: 'rgba(255,255,255,0.88)', border: 'none', cursor: 'pointer',
            width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.88)')}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} style={{ fill: wishlisted ? '#C9A84C' : 'none', color: wishlisted ? '#C9A84C' : '#555', transition: 'all 0.2s' }} />
        </button>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1rem', fontWeight: 400, color: hovered ? '#C9A84C' : '#1A1A1A',
              letterSpacing: '0.02em', lineHeight: 1.3, transition: 'color 0.2s',
            }}
          >
            {p.title}
          </h3>
        </Link>

        {(p.metalType || p.carat || p.brand) && (
          <p style={{ fontSize: '11px', color: '#555555', letterSpacing: '0.05em' }}>
            {[p.brand, p.metalType, p.carat].filter(Boolean).join(' · ')}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
            {formatGBP(Number(p.baseCost))}
          </p>
          <Link href={`/products/${p.slug}`} style={{
            fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#C9A84C', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '4px',
            borderBottom: '1px solid rgba(201,168,76,0.4)', paddingBottom: '1px',
          }}>
            Discover <ArrowRight size={9} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [metalType, setMetalType] = useState(searchParams.get('metalType') || '');
  const [carat, setCarat] = useState('');
  const [gemstone, setGemstone] = useState(searchParams.get('gemstone') || '');
  const [diamondShape, setDiamondShape] = useState(searchParams.get('diamondShape') || '');
  const [brand, setBrand] = useState('');
  const [weightRange, setWeightRange] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    categoryApi.getAll().then(({ data }) => setCategories(data.data ?? []));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const wr = weightRange !== null ? WEIGHT_RANGES[weightRange] : null;
      const pr = priceRange !== null ? PRICE_RANGES[priceRange] : null;
      const { data } = await productApi.getAll({
        page, limit: 24, isActive: 'true',
        search:       search       || undefined,
        categoryId:   categoryId   || undefined,
        metalType:    metalType    ? METAL_TYPE_MAP[metalType] ?? metalType.toUpperCase() : undefined,
        carat:        carat        || undefined,
        brand:        brand        || undefined,
        gemstone:     gemstone     || undefined,
        diamondShape: diamondShape || undefined,
        minWeight:    wr           ? String(wr.min) : undefined,
        maxWeight:    wr && wr.max !== Infinity ? String(wr.max) : undefined,
        minPrice:     pr           ? String(pr.min) : undefined,
        maxPrice:     pr && pr.max !== Infinity ? String(pr.max) : undefined,
        sortBy:       sort === 'price-asc' || sort === 'price-desc' ? 'baseCost'
                    : sort === 'name-asc'  || sort === 'name-desc'  ? 'title'
                    : undefined,
        order:        sort === 'price-asc' || sort === 'name-asc' ? 'asc'
                    : sort === 'price-desc' || sort === 'name-desc' ? 'desc'
                    : undefined,
      });
      const list: Product[] = data.data ?? [];
      const withImages = await Promise.all(
        list.map(async (p) => {
          if (p.images && p.images.length > 0) return p;
          try {
            const detail = await productApi.getBySlug(p.slug);
            return detail.data.data ?? p;
          } catch { return p; }
        })
      );
      setProducts(withImages);
      setTotal(data.meta?.total ?? 0);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, metalType, carat, brand, gemstone, diamondShape, weightRange, priceRange, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // All filtering and sorting is now server-side; displayProducts is a pass-through
  const displayProducts = products;

  const resetFilters = () => {
    setSearch(''); setCategoryId(''); setMetalType('');
    setCarat(''); setGemstone(''); setDiamondShape('');
    setBrand(''); setWeightRange(null); setPriceRange(null); setSort('featured'); setPage(1);
  };
  const hasFilters = !!(search || categoryId || metalType || carat || gemstone || diamondShape || brand || weightRange !== null || priceRange !== null);

  const handleAddToCart = (p: Product) => {
    addItem({
      productId: p.id, title: p.title, price: Number(p.baseCost),
      imageUrl: p.images?.[0]?.url, sku: p.slug,
      metalType: p.metalType, carat: p.carat ?? undefined, quantity: 1,
    });
    toast.success(`${p.title} added to bag`);
  };

  const SidebarContent = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
          Refine By
        </h2>
        {hasFilters && (
          <button onClick={resetFilters} style={{ fontSize: '10px', color: '#C9A84C', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <X size={10} /> Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#555555', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search pieces…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '8px 10px 8px 30px',
              border: '1px solid #e5e5e5', fontSize: '12px', color: '#1A1A1A',
              outline: 'none', boxSizing: 'border-box', backgroundColor: '#fafafa',
            }}
          />
        </div>
      </div>

      <FilterSection title="Category">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CheckItem label="All Collections" active={!categoryId} onClick={() => { setCategoryId(''); setPage(1); }} />
          {categories.map(c => (
            <CheckItem key={c.id} label={c.name} active={categoryId === c.id} onClick={() => { setCategoryId(c.id); setPage(1); }} />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Gemstones">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {GEMSTONES.map(g => (
            <CheckItem key={g} label={g} active={gemstone === g} onClick={() => { setGemstone(gemstone === g ? '' : g); setPage(1); }} />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Diamond Shape">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {DIAMOND_SHAPES.map(s => (
            <CheckItem key={s} label={s} active={diamondShape === s} onClick={() => { setDiamondShape(diamondShape === s ? '' : s); setPage(1); }} />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Metals">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {METAL_TYPES.map(m => (
            <li key={m} style={{ listStyle: 'none' }}>
              <button
                onClick={() => { setMetalType(metalType === m ? '' : m); setPage(1); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span style={{
                  width: '18px', height: '18px', flexShrink: 0, borderRadius: '50%',
                  backgroundColor: METAL_SWATCHES[m] ?? '#ccc',
                  border: `2px solid ${metalType === m ? '#C9A84C' : '#e5e5e5'}`,
                  boxShadow: metalType === m ? '0 0 0 2px rgba(201,168,76,0.3)' : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }} />
                <span style={{ fontSize: '13px', color: metalType === m ? '#C9A84C' : '#444444' }}>{m}</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Carat / Purity">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {CARATS.map(c => (
            <CheckItem key={c} label={c} active={carat === c} onClick={() => setCarat(carat === c ? '' : c)} />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Weight">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {WEIGHT_RANGES.map((r, i) => (
            <CheckItem key={r.label} label={r.label} active={weightRange === i} onClick={() => { setWeightRange(weightRange === i ? null : i); setPage(1); }} />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Brand / Maker" defaultOpen={false}>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#555555', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search brands…"
            value={brand}
            onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '7px 8px 7px 26px',
              border: '1px solid #e5e5e5', fontSize: '12px', color: '#1A1A1A',
              outline: 'none', boxSizing: 'border-box', backgroundColor: '#fafafa',
            }}
          />
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRICE_RANGES.map((r, i) => (
            <CheckItem key={r.label} label={r.label} active={priceRange === i} onClick={() => setPriceRange(priceRange === i ? null : i)} />
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Sort By" defaultOpen={false}>
        <ul style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SORT_OPTIONS.map(s => (
            <CheckItem key={s.value} label={s.label} active={sort === s.value} onClick={() => setSort(s.value)} radio />
          ))}
        </ul>
      </FilterSection>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#FAFAF8', minHeight: '100vh' }}>

      {/* PAGE HEADER */}
      <div style={{ borderBottom: '1px solid rgba(201,168,76,0.15)', backgroundColor: '#fff', padding: '48px 0 32px' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p style={{ color: '#1A1A1A', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Our Collections
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300,
              color: '#1A1A1A', letterSpacing: '0.04em', lineHeight: 1, margin: 0,
            }}>
              All Jewellery
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <p style={{ fontSize: '12px', color: '#1A1A1A', letterSpacing: '0.1em', margin: 0 }}>
                {loading ? '…' : `${total} pieces`}
              </p>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: '1px solid #1A1A1A', padding: '8px 14px',
                  fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#1A1A1A', background: 'none', cursor: 'pointer',
                }}
              >
                <SlidersHorizontal size={13} /> Filters
                {hasFilters && <span style={{ width: '6px', height: '6px', backgroundColor: '#C9A84C', borderRadius: '50%' }} />}
              </button>
            </div>
          </div>
          <div style={{ width: '48px', height: '1px', backgroundColor: '#C9A84C', marginTop: '16px', opacity: 0.6 }} />
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', padding: '10px 0' }}>
          <div className="max-w-7xl mx-auto px-6" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: '#1A1A1A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active:</span>
            {search && <Chip label={`"${search}"`} onRemove={() => setSearch('')} />}
            {categoryId && <Chip label={categories.find(c => c.id === categoryId)?.name ?? 'Category'} onRemove={() => setCategoryId('')} />}
            {metalType && <Chip label={metalType} onRemove={() => setMetalType('')} />}
            {carat && <Chip label={carat} onRemove={() => setCarat('')} />}
            {gemstone && <Chip label={gemstone} onRemove={() => setGemstone('')} />}
            {diamondShape && <Chip label={`${diamondShape} Cut`} onRemove={() => setDiamondShape('')} />}
            {brand && <Chip label={`Brand: ${brand}`} onRemove={() => setBrand('')} />}
            {weightRange !== null && <Chip label={WEIGHT_RANGES[weightRange].label} onRemove={() => setWeightRange(null)} />}
            {priceRange !== null && <Chip label={PRICE_RANGES[priceRange].label} onRemove={() => setPriceRange(null)} />}
            <button onClick={resetFilters} style={{ fontSize: '10px', color: '#B00020', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}>
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div onClick={() => setMobileFiltersOpen(false)} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'relative', zIndex: 1, width: '300px', backgroundColor: '#fff', padding: '24px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>

          {/* Sidebar desktop */}
          <div className="hidden lg:block" style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <SidebarContent />
          </div>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '12px', color: '#1A1A1A', margin: 0 }}>
                {loading ? 'Loading…' : `Showing ${displayProducts.length} of ${total} pieces`}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#1A1A1A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sort:</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  style={{ border: '1px solid #e5e5e5', padding: '6px 10px', fontSize: '12px', color: '#1A1A1A', backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                  {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="animate-pulse" style={{ aspectRatio: '3/4', backgroundColor: '#efefef' }} />
                    <div className="animate-pulse" style={{ height: '10px', backgroundColor: '#efefef', width: '70%' }} />
                    <div className="animate-pulse" style={{ height: '10px', backgroundColor: '#efefef', width: '45%' }} />
                  </div>
                ))}
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', fontWeight: 300, color: 'rgba(26,26,26,0.25)', marginBottom: '12px' }}>
                  No pieces found
                </p>
                <p style={{ fontSize: '13px', color: '#555555', marginBottom: '20px' }}>Try adjusting your filters</p>
                <button onClick={resetFilters} style={{
                  border: '1px solid rgba(201,168,76,0.5)', color: '#C9A84C',
                  padding: '10px 24px', fontSize: '10px', letterSpacing: '0.2em',
                  textTransform: 'uppercase', background: 'none', cursor: 'pointer',
                }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {displayProducts.map(p => (
                  <ProductCardLuxury key={p.id} product={p} onAddToCart={() => handleAddToCart(p)} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '48px' }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{
                      width: '38px', height: '38px', fontSize: '12px', cursor: 'pointer',
                      backgroundColor: page === i + 1 ? '#C9A84C' : 'transparent',
                      color: page === i + 1 ? '#fff' : '#444444',
                      border: page === i + 1 ? '1px solid #C9A84C' : '1px solid #e5e5e5',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISCOVER BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #0a0800 0%, #1a1200 50%, #0a0800 100%)',
        borderTop: '1px solid rgba(201,168,76,0.2)',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid md:grid-cols-3 gap-8">

            <div style={{ textAlign: 'center', padding: '36px 24px', border: '1px solid rgba(201,168,76,0.15)' }}>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#C9A84C', margin: '0 auto 20px', opacity: 0.5 }} />
              <p style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '10px' }}>Commission</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 300, color: '#fff', letterSpacing: '0.04em', marginBottom: '14px', lineHeight: 1.2 }}>
                Bespoke Jewellery
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.9, marginBottom: '24px' }}>
                Commission a one-of-a-kind piece crafted to your exact specifications by our master goldsmiths.
              </p>
              <Link href="/bespoke" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                border: '1px solid rgba(201,168,76,0.45)', color: '#C9A84C',
                padding: '9px 20px', fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                DISCOVER <ArrowRight size={11} />
              </Link>
            </div>

            <div style={{ textAlign: 'center', padding: '36px 24px', border: '1px solid rgba(201,168,76,0.15)', backgroundColor: 'rgba(201,168,76,0.03)' }}>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#C9A84C', margin: '0 auto 20px', opacity: 0.5 }} />
              <p style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '10px' }}>Authenticity</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 300, color: '#fff', letterSpacing: '0.04em', marginBottom: '14px', lineHeight: 1.2 }}>
                Hallmarked & Certified
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.9, marginBottom: '24px' }}>
                Every piece is hallmarked by the London Assay Office. World-class gold standards, guaranteed.
              </p>
              <Link href="/about" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                border: '1px solid rgba(201,168,76,0.45)', color: '#C9A84C',
                padding: '9px 20px', fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                DISCOVER <ArrowRight size={11} />
              </Link>
            </div>

            <div style={{ textAlign: 'center', padding: '36px 24px', border: '1px solid rgba(201,168,76,0.15)' }}>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#C9A84C', margin: '0 auto 20px', opacity: 0.5 }} />
              <p style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '10px' }}>Visit Us</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 300, color: '#fff', letterSpacing: '0.04em', marginBottom: '14px', lineHeight: 1.2 }}>
                Private Appointment
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.9, marginBottom: '24px' }}>
                Experience our collections in person. Our expert team is here to guide your perfect piece.
              </p>
              <Link href="/appointments" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                border: '1px solid rgba(201,168,76,0.45)', color: '#C9A84C',
                padding: '9px 20px', fontSize: '9px', letterSpacing: '0.2em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                DISCOVER <ArrowRight size={11} />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default function ProductsPageWrapper() {
  return <Suspense fallback={null}><ProductsPage /></Suspense>;
}
