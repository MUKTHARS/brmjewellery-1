'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, CheckCircle2, Heart, ArrowLeft, ChevronDown, ChevronUp, FileText, Truck } from 'lucide-react';
import ImageGallery from '@/components/user/ImageGallery';
import StarRating from '@/components/user/StarRating';
import ProductCard from '@/components/user/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate } from '@/lib/formatDate';
import toast from 'react-hot-toast';

// ── Constants ──────────────────────────────────────────────────────────────────
const UK_RING_SIZES = [
  'D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'Z+1','Z+2','Z+3',
];
const RING_WIDTHS    = ['2mm','3mm','4mm','5mm','6mm','7mm','8mm','10mm','12mm'];
const RING_PROFILES  = ['D Shape','Court Shape','Cushion Court Shape','Flat Shape','Flat Comfort Fit'];
const RING_WEIGHTS   = ['Classic Weight','Extra Heavy Weight','Super Heavy Weight'];
const METAL_OPTIONS  = ['Yellow Gold','White Gold','Rose Gold','Platinum','Palladium','Silver'];
const CARAT_OPTIONS  = ['9ct','14ct','18ct','22ct','925','500','950'];
const RING_FINISHES  = ['Polished','Matte','Brushed','Sandblasted'];
const ENGRAVING_FONTS = [
  'Block Capitals',
  'Script',
  'Times New Roman',
  'Diamond Cut',
];
const MAX_ENGRAVING = 40;

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProductVariant {
  id: string; finishName: string; badge: string; metalType?: string; carat?: string;
  isPremium: boolean; price: number; stockQty: number; sku: string; sortOrder: number;
  ringWidth?: string; ringProfile?: string; ringWeight?: string;
}
interface Product {
  id: string; title: string; slug: string; description?: string; story?: string; brand?: string;
  baseCost: number; metalType?: string; carat?: string; weightGrams?: number; sku: string;
  stockQty: number; isActive: boolean;
  images: { id: string; url: string; altText?: string; isPrimary: boolean }[];
  category?: { id: string; name: string; slug: string };
  attributes: { id: string; fieldName: string; fieldLabel: string; value: string }[];
  variants: ProductVariant[];
}
interface Review {
  id: string; rating: number; title?: string; body?: string; createdAt: string;
  isVerifiedPurchase: boolean; user: { firstName: string; lastName: string };
}
interface Props { product: Product; reviews: Review[]; relatedProducts: Product[]; }

// ── Metal gradient helpers ─────────────────────────────────────────────────────
const metalGradient = (v: ProductVariant) => {
  const n = v.finishName.toLowerCase();
  if (n.includes('platinum') || n.includes('palladium')) return 'linear-gradient(135deg,#e8e8e8,#d4d4d4,#b0b0b0)';
  if (n.includes('white gold')) return 'linear-gradient(135deg,#f0f0f0,#d8d8d8,#b8b8b8)';
  if (n.includes('rose gold'))  return 'linear-gradient(135deg,#f5c5b0,#e8a090,#c87860)';
  if (n.includes('gold'))       return 'linear-gradient(135deg,#f5d97a,#C9A84C,#a8782a)';
  return 'linear-gradient(135deg,#e8e8e8,#c8c8c8,#a0a0a0)';
};
const metalTextColor = (v: ProductVariant) => {
  const n = v.finishName.toLowerCase();
  if (n.includes('yellow gold') || n.includes('rose gold')) return '#7a5c1a';
  return '#555';
};

// ── Row layout helper ──────────────────────────────────────────────────────────
function OptionRow({ label, sub, link, linkHref, required, children }: {
  label: string; sub?: string; link?: string; linkHref?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-4 items-start py-3.5 border-b border-gold/10 last:border-0">
      <div className="pt-1">
        <p className="text-sm font-medium text-ink">
          {label}{required && <span className="text-danger ml-0.5">*</span>}
        </p>
        {sub  && <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{sub}</p>}
        {link && linkHref && (
          <a href={linkHref} className="text-xs text-gold underline hover:text-gold/70 mt-0.5 inline-block">{link}</a>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function RingProductDetail({ product, reviews, relatedProducts }: Props) {
  const router  = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();

  const sortedImages = useMemo(
    () => [...product.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)),
    [product.images],
  );
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // ── Unique metals from admin variants ─────────────────────────────────────
  const uniqueMetals = useMemo(() => {
    const seen = new Set<string>();
    return product.variants.filter(v => { if (seen.has(v.finishName)) return false; seen.add(v.finishName); return true; });
  }, [product.variants]);

  const hasRingDimensions = useMemo(
    () => product.variants.some(v => v.ringWidth || v.ringProfile || v.ringWeight),
    [product.variants],
  );

  // ── Selections ─────────────────────────────────────────────────────────────
  const [selectedMetal,    setSelectedMetal]    = useState(uniqueMetals[0]?.finishName ?? '');
  const [selectedCarat,    setSelectedCarat]    = useState(uniqueMetals[0]?.carat ?? '');
  const [selectedWidth,    setSelectedWidth]    = useState('');
  const [selectedProfile,  setSelectedProfile]  = useState('');
  const [selectedWeight,   setSelectedWeight]   = useState('');
  const [selectedRingSize, setSelectedRingSize] = useState('');
  const [ringFinish,       setRingFinish]       = useState('');
  const [engravingFont,    setEngravingFont]    = useState('');
  const [engravingText,    setEngravingText]    = useState('');
  const [customiseOpen,    setCustomiseOpen]    = useState(false);
  const [qty,              setQty]              = useState(1);
  const [added,            setAdded]            = useState(false);
  const [activeTab,        setActiveTab]        = useState<'details' | 'story' | 'delivery'>('details');
  const [openSection,      setOpenSection]      = useState<'details' | 'story' | 'delivery' | null>(null);

  // ── Variants for selected metal ────────────────────────────────────────────
  const metalVariants = useMemo(
    () => product.variants.filter(v => v.finishName === selectedMetal),
    [product.variants, selectedMetal],
  );
  const availableWidths   = useMemo(() => RING_WIDTHS.filter(w => metalVariants.some(v => v.ringWidth === w)), [metalVariants]);
  const availableProfiles = useMemo(() => RING_PROFILES.filter(p => metalVariants.some(v => v.ringProfile === p && (!selectedWidth || v.ringWidth === selectedWidth))), [metalVariants, selectedWidth]);
  const availableWeights  = useMemo(() => RING_WEIGHTS.filter(w => metalVariants.some(v => v.ringWeight === w && (!selectedWidth || v.ringWidth === selectedWidth) && (!selectedProfile || v.ringProfile === selectedProfile))), [metalVariants, selectedWidth, selectedProfile]);
  const uniqueCarats = useMemo(() => {
    const seen = new Set<string>();
    return product.variants.filter(v => v.carat && !seen.has(v.carat) && seen.add(v.carat) as unknown as boolean).map(v => v.carat as string);
  }, [product.variants]);

  // ── Matched variant ────────────────────────────────────────────────────────
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    const hits = metalVariants.filter(v =>
      (!selectedWidth   || !availableWidths.length   || v.ringWidth   === selectedWidth)   &&
      (!selectedProfile || !availableProfiles.length || v.ringProfile === selectedProfile) &&
      (!selectedWeight  || !availableWeights.length  || v.ringWeight  === selectedWeight),
    );
    return hits[0] ?? metalVariants[0] ?? null;
  }, [metalVariants, selectedWidth, selectedProfile, selectedWeight, availableWidths, availableProfiles, availableWeights]);

  const handleMetalChange = (finishName: string) => {
    setSelectedMetal(finishName);
    const mv = product.variants.filter(v => v.finishName === finishName);
    setSelectedWidth(RING_WIDTHS.find(w => mv.some(v => v.ringWidth === w)) ?? '');
    setSelectedProfile(RING_PROFILES.find(p => mv.some(v => v.ringProfile === p)) ?? '');
    setSelectedWeight(RING_WEIGHTS.find(w => mv.some(v => v.ringWeight === w)) ?? '');
  };

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.baseCost);
  const inStock      = selectedVariant ? selectedVariant.stockQty > 0 : product.stockQty > 0;
  const maxQty       = selectedVariant ? selectedVariant.stockQty : product.stockQty;
  const charsLeft    = MAX_ENGRAVING - engravingText.length;

  const handleAddToCart = () => {
    if (!selectedRingSize) { toast.error('Please select a finger size'); return; }
    addItem({
      productId: product.id, title: product.title, price: displayPrice,
      imageUrl: sortedImages[0]?.url, sku: selectedVariant?.sku ?? product.sku,
      metalType: selectedVariant?.metalType ?? product.metalType,
      carat: selectedVariant?.carat ?? product.carat ?? undefined,
      quantity: qty, variantId: selectedVariant?.id, finishName: selectedMetal,
      ringWidth: selectedWidth || undefined, ringProfile: selectedProfile || undefined,
      ringWeight: selectedWeight || undefined, ringSize: selectedRingSize,
      ringFinish: ringFinish || undefined,
      engravingText: engravingText || undefined,
      engravingFont: engravingText && engravingFont ? engravingFont : undefined,
    });
    setAdded(true);
    toast.success('Added to bag');
    setTimeout(() => setAdded(false), 2000);
  };

  // shared dropdown class
  const dropCls = 'w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-gold appearance-none cursor-pointer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Collections
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
        {/* ── Gallery ── */}
        <div><ImageGallery images={sortedImages} /></div>

        {/* ── Right panel ── */}
        <div>
          {/* Category + Title + Rating */}
          {product.category && <p className="text-gold text-xs uppercase tracking-widest mb-2">{product.category.name}</p>}
          <h1 className="font-cormorant text-3xl font-light text-ink leading-snug mb-2">{product.title}</h1>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={avgRating} size={13} />
              <span className="text-xs text-ink-muted">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}

          {/* ── Metal selector (circles from admin variants) ── */}
          {uniqueMetals.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-2">
                Metal — <span className="text-ink normal-case">{selectedMetal}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueMetals.map(v => {
                  const active = selectedMetal === v.finishName;
                  return (
                    <button key={v.finishName} onClick={() => handleMetalChange(v.finishName)} title={v.finishName}
                      className={`relative flex flex-col items-center gap-1 border p-2 transition-all min-w-[68px] ${active ? 'border-gold bg-cream' : 'border-gray-200 hover:border-gold/50'}`}>
                      {active && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold flex items-center justify-center z-10">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                      )}
                      <span className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-bold leading-tight text-center"
                        style={{ background: metalGradient(v), color: metalTextColor(v) }}>
                        {v.badge}
                      </span>
                      <span className="text-[9px] font-medium text-ink leading-tight text-center whitespace-nowrap max-w-[60px] truncate">{v.finishName}</span>
                      <span className="text-[10px] text-gold font-medium">{formatGBP(Number(v.price))}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Customise your ring (collapsible — width/profile/weight) ── */}
          <div className="border border-gray-200 mb-5">
            <button onClick={() => setCustomiseOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
              <span className="text-sm text-ink">Customise your ring</span>
              {customiseOpen ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
            </button>

            {customiseOpen && (
              <div className="border-t border-gray-100 px-4 py-5 space-y-5 bg-white">
                {/* Metal */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">Metal</p>
                  <div className="flex flex-wrap gap-2">
                    {(uniqueMetals.length > 0 ? uniqueMetals.map(v => v.finishName) : METAL_OPTIONS).map(name => {
                      const variant = uniqueMetals.find(v => v.finishName === name);
                      const goldGrad = 'linear-gradient(135deg,#f5d97a,#C9A84C,#a8782a)';
                      const whiteGrad = 'linear-gradient(135deg,#f0f0f0,#d8d8d8,#b8b8b8)';
                      const roseGrad = 'linear-gradient(135deg,#f5c5b0,#e8a090,#c87860)';
                      const platGrad = 'linear-gradient(135deg,#e8e8e8,#d4d4d4,#b0b0b0)';
                      const silverGrad = 'linear-gradient(135deg,#e8e8e8,#c8c8c8,#a0a0a0)';
                      const bg = variant ? metalGradient(variant) : name.includes('Rose') ? roseGrad : name.includes('White') ? whiteGrad : name.includes('Platinum') || name.includes('Palladium') ? platGrad : name.includes('Silver') ? silverGrad : goldGrad;
                      return (
                        <button key={name} onClick={() => { if (variant) { handleMetalChange(name); setSelectedCarat(variant.carat ?? ''); } else setSelectedMetal(name); }}
                          className={`flex flex-col items-center gap-1 border px-3 py-2 min-w-[60px] transition-all ${selectedMetal === name ? 'border-gold bg-cream' : 'border-gray-200 hover:border-gold/60'}`}>
                          <span className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: bg }} />
                          <span className="text-[10px] text-center leading-tight text-ink whitespace-nowrap">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Carat / Purity */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">Carat / Purity</p>
                  <div className="flex flex-wrap gap-2">
                    {(uniqueCarats.length > 0 ? uniqueCarats : CARAT_OPTIONS).map(c => (
                      <button key={c} onClick={() => setSelectedCarat(c)}
                        className={`px-3 py-1.5 text-xs border transition-all ${selectedCarat === c ? 'border-gold bg-gold text-white' : 'border-gray-300 text-ink hover:border-gold'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">Ring Width</p>
                  <div className="flex flex-wrap gap-2">
                    {(availableWidths.length > 0 ? availableWidths : RING_WIDTHS).map(w => (
                      <button key={w} onClick={() => setSelectedWidth(w)}
                        className={`px-3 py-1.5 text-xs border transition-all ${selectedWidth === w ? 'border-gold bg-gold text-white' : 'border-gray-300 text-ink hover:border-gold'}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">Ring Profile</p>
                  <div className="flex flex-wrap gap-2">
                    {(availableProfiles.length > 0 ? availableProfiles : RING_PROFILES).map(p => (
                      <button key={p} onClick={() => setSelectedProfile(p)}
                        className={`flex flex-col items-center gap-1.5 border px-3 py-3 min-w-[76px] transition-all ${selectedProfile === p ? 'border-gold bg-cream' : 'border-gray-200 hover:border-gold/60'}`}>
                        <img src="/assets/dshape.webp" alt={p}
                          className="w-12 h-10 object-cover rounded" />
                        <span className="text-[10px] text-center leading-tight text-ink">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">Ring Weight</p>
                  <div className="flex flex-wrap gap-2">
                    {(availableWeights.length > 0 ? availableWeights : RING_WEIGHTS).map(w => (
                      <button key={w} onClick={() => setSelectedWeight(w)}
                        className={`flex flex-col items-center gap-1.5 border px-3 py-3 min-w-[80px] transition-all ${selectedWeight === w ? 'border-gold bg-cream' : 'border-gray-200 hover:border-gold/60'}`}>
                        <img src="/assets/dshape.webp" alt={w}
                          className="w-12 h-10 object-cover rounded" />
                        <span className="text-[10px] text-center leading-tight text-ink">{w}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Price block ── */}
          <div className="mb-5">
            <p className="font-cormorant text-3xl font-light text-ink">{formatGBP(displayPrice)}</p>
            <p className="text-xs text-ink-muted mt-0.5">Including VAT for UK orders.</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', backgroundColor:'#fcd7e1', padding:'5px 10px', marginTop:'8px' }}>
              <img src="/assets/Klarna-logo.png" alt="Klarna" style={{ height:'28px', width:'auto' }} />
              <span style={{ fontSize:'11px', fontWeight:600, color:'#1a1a1a' }}>
                or 3 interest-free payments of {formatGBP(parseFloat((displayPrice / 3).toFixed(2)))}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-2">Usually dispatched in 3–5 working days.</p>
          </div>

          {/* ── Option rows ── */}
          <div className="border-t border-gray-200">

            {/* Finger Size */}
            <OptionRow label="Finger Size" required link="Need help? Find your size" linkHref="/ring-builder">
              <div className="relative">
                <select value={selectedRingSize} onChange={e => setSelectedRingSize(e.target.value)} className={dropCls}>
                  <option value="">Please select your size</option>
                  {UK_RING_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </OptionRow>

            {/* Finish */}
            <OptionRow label="Finish" required link="Click to see examples" linkHref="/ring-builder#finish">
              <div className="relative">
                <select value={ringFinish} onChange={e => setRingFinish(e.target.value)} className={dropCls}>
                  <option value="">Select Finish</option>
                  {RING_FINISHES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </OptionRow>

            {/* Engraving Font */}
            <OptionRow label="Engraving Font (optional)" link="Click to see engraving examples" linkHref="/ring-builder#engraving">
              <div className="relative">
                <select value={engravingFont} onChange={e => setEngravingFont(e.target.value)} className={dropCls}>
                  <option value="">Select Font</option>
                  {ENGRAVING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
              </div>
            </OptionRow>

            {/* Engraving Text */}
            <OptionRow
              label="Engraving Text (inside ring)"
              sub={`[Maximum ${MAX_ENGRAVING} characters]\nWe can engrave the inside of our wedding rings with letters, numbers and symbols.`}>
              <div>
                <input
                  type="text"
                  maxLength={MAX_ENGRAVING}
                  value={engravingText}
                  onChange={e => setEngravingText(e.target.value)}
                  placeholder="Engraving text"
                  className="w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-ink-muted mt-1">{charsLeft} Characters remaining</p>
              </div>
            </OptionRow>
          </div>

          {/* ── Stock ── */}
          <div className="flex items-center gap-2 mt-4">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-xs text-ink-muted">{inStock ? `In stock (${maxQty} available)` : 'Out of stock'}</span>
          </div>

          {/* ── Qty + Buttons ── */}
          {inStock && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors"><Minus size={14} /></button>
                  <span className="px-4 py-2 text-sm tabular-nums min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors"><Plus size={14} /></button>
                </div>
                <span className="text-xs text-ink-muted">Max {maxQty}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={added}
                  className="flex-1 btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-70">
                  {added ? <><CheckCircle2 size={16} /> Added to Bag</> : <><ShoppingBag size={16} /> Add to Bag</>}
                </button>
                <button
                  onClick={() => {
                    if (!user) { router.push('/login?redirect=' + encodeURIComponent(`/products/${product.slug}`)); return; }
                    toggle({ productId: product.id, slug: product.slug, title: product.title, price: displayPrice, imageUrl: sortedImages[0]?.url, metalType: product.metalType, carat: product.carat ?? undefined, category: product.category?.name });
                    toast.success(isWishlisted(product.id) ? 'Removed from wishlist' : 'Added to wishlist');
                  }}
                  className="border border-gray-300 px-4 py-3.5 flex items-center justify-center hover:border-gold transition-colors"
                  aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart size={18} style={{ fill: isWishlisted(product.id) ? '#C9A84C' : 'none', color: isWishlisted(product.id) ? '#C9A84C' : '#888' }} />
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-ink-muted mt-3">SKU: {selectedVariant?.sku ?? product.sku}</p>

          {/* ── Trust badges ── */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-[10px] text-ink-muted uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-[8px]">NAJ</span>NAJ Member
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-ink-muted uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-[8px]">✦</span>Assay Assured
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-ink-muted uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-[8px]">UK</span>Hallmarked
            </div>
          </div>

          {/* ── Info accordions ── */}
          <div className="mt-6 border-t border-gray-200">
            {([
              {
                key: 'details' as const,
                icon: <FileText size={16} className="text-ink-muted" />,
                label: 'Product Details',
                content: (
                  <div className="space-y-3 text-sm text-ink-muted leading-relaxed">
                    {product.description && <p>{product.description}</p>}
                    <table className="w-full mt-2">
                      <tbody>
                        {product.brand       && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Brand</td><td className="py-2 text-ink text-sm">{product.brand}</td></tr>}
                        {selectedMetal       && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Metal</td><td className="py-2 text-ink text-sm">{selectedMetal}</td></tr>}
                        {selectedVariant?.carat && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Carat</td><td className="py-2 text-ink text-sm">{selectedVariant.carat}</td></tr>}
                        {product.weightGrams && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Weight</td><td className="py-2 text-ink text-sm">{Number(product.weightGrams).toFixed(3)}g</td></tr>}
                        {selectedWidth       && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Width</td><td className="py-2 text-ink text-sm">{selectedWidth}</td></tr>}
                        {selectedProfile     && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Profile</td><td className="py-2 text-ink text-sm">{selectedProfile}</td></tr>}
                        {selectedWeight      && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Weight Type</td><td className="py-2 text-ink text-sm">{selectedWeight}</td></tr>}
                        {ringFinish          && <tr className="border-b border-gray-100"><td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">Finish</td><td className="py-2 text-ink text-sm">{ringFinish}</td></tr>}
                        {product.attributes.map(a => (
                          <tr key={a.id} className="border-b border-gray-100">
                            <td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-36">{a.fieldLabel}</td>
                            <td className="py-2 text-ink text-sm">{a.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ),
              },
              {
                key: 'delivery' as const,
                icon: <Truck size={16} className="text-ink-muted" />,
                label: 'Delivery & Returns',
                content: (
                  <div className="space-y-3 text-sm text-ink-muted">
                    <div><p className="font-medium text-ink mb-0.5">Standard Delivery (3–5 days) — Free</p><p>Tracked and insured with Royal Mail Signed For. All UK orders delivered free of charge.</p></div>
                    <div><p className="font-medium text-ink mb-0.5">Express Delivery (1–2 days)</p><p>Next working day on orders placed before 1pm GMT.</p></div>
                    <div><p className="font-medium text-ink mb-0.5">Free Ring Resizing</p><p>One free resize within 60 days of purchase. <a href="/ring-builder" className="text-gold hover:underline">Learn more</a>.</p></div>
                    <div><p className="font-medium text-ink mb-0.5">Returns — 30 Days</p><p>Unworn items in original packaging may be returned within 30 days. Engraved and bespoke items are non-returnable.</p></div>
                  </div>
                ),
              },
            ] as { key: 'details' | 'story' | 'delivery'; icon: React.ReactNode; label: string; content: React.ReactNode }[]).map(({ key, icon, label, content }) => (
              <div key={key} className="border-b border-gray-200">
                <button onClick={() => setOpenSection(openSection === key ? null : key)}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50/50 transition-colors px-1">
                  <span className="flex items-center gap-2.5">
                    {icon}
                    <span className="text-sm text-ink">{label}</span>
                  </span>
                  <ChevronDown size={15} className={`text-ink-muted transition-transform ${openSection === key ? 'rotate-180' : ''}`} />
                </button>
                {openSection === key && (
                  <div className="pb-4 px-1">{content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      {reviews.length > 0 && (
        <div className="mb-16">
          <div className="flex items-baseline gap-4 mb-6">
            <h2 className="font-cormorant text-2xl font-light text-ink">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size={14} />
              <span className="text-sm text-ink-muted">{avgRating.toFixed(1)} ({reviews.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(r => (
              <div key={r.id} className="border border-gold/10 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{r.user.firstName} {r.user.lastName.charAt(0)}.</p>
                    <p className="text-xs text-ink-muted">{formatUKDate(r.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StarRating rating={r.rating} size={12} />
                    {r.isVerifiedPurchase && <span className="text-[10px] text-success uppercase tracking-wider">Verified</span>}
                  </div>
                </div>
                {r.title && <p className="text-sm font-medium text-ink mb-1">{r.title}</p>}
                {r.body  && <p className="text-sm text-ink-muted leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Related products ── */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-gold/10">
          <h2 className="font-cormorant text-2xl font-light text-ink mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => {
              const primaryImage = p.images.find(img => img.isPrimary) ?? p.images[0];
              return (
                <ProductCard key={p.id} id={p.id} slug={p.slug} title={p.title} price={Number(p.baseCost)}
                  imageUrl={primaryImage?.url} metalType={p.metalType} carat={p.carat ?? undefined}
                  category={p.category?.name}
                  onAddToCart={() => addItem({ productId: p.id, title: p.title, price: Number(p.baseCost), imageUrl: primaryImage?.url, sku: p.sku, metalType: p.metalType, carat: p.carat ?? undefined, quantity: 1 })}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
