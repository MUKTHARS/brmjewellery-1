'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Minus, Plus, ShoppingBag, ArrowLeft, CheckCircle2, Heart } from 'lucide-react';
import { productApi } from '@/api/product.api';
import { reviewApi } from '@/api/review.api';
import ImageGallery from '@/components/user/ImageGallery';
import StarRating from '@/components/user/StarRating';
import ProductCard from '@/components/user/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatGBP } from '@/lib/formatCurrency';
import { formatUKDate } from '@/lib/formatDate';
import toast from 'react-hot-toast';

interface ProductVariant {
  id: string;
  finishName: string;
  badge: string;
  metalType?: string;
  carat?: string;
  isPremium: boolean;
  price: number;
  stockQty: number;
  sku: string;
  sortOrder: number;
}

interface Product {
  id: string; title: string; slug: string; description?: string; story?: string; brand?: string;
  baseCost: number; metalType?: string; carat?: string; weightGrams?: number; sku: string;
  stockQty: number; isActive: boolean;
  images: { id: string; url: string; altText?: string; isPrimary: boolean }[];
  category?: { id: string; name: string };
  attributes: { id: string; fieldName: string; fieldLabel: string; value: string }[];
  variants: ProductVariant[];
}
interface Review {
  id: string; rating: number; title?: string; body?: string; createdAt: string;
  isVerifiedPurchase: boolean; user: { firstName: string; lastName: string };
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'story' | 'delivery'>('details');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.allSettled([
          productApi.getBySlug(slug),
          reviewApi.getAll({ productSlug: slug, isVisible: 'true', limit: 10 }),
        ]);
        if (pRes.status === 'fulfilled') {
          const p = pRes.value.data.data;
          setProduct(p);
          if (p?.variants?.length > 0) {
            const variantParam = searchParams.get('variant');
            const preselected = variantParam
              ? p.variants.find((v: ProductVariant) => v.id === variantParam) ?? p.variants[0]
              : p.variants[0];
            setSelectedVariant(preselected);
          }
          const params: Record<string, string | number> = { limit: 8, isActive: 'true' };
          if (p?.category?.id) params.categoryId = p.category.id;
          const relRes = await productApi.getAll(params);
          const all: Product[] = relRes.data.data ?? relRes.data ?? [];
          setRelatedProducts(all.filter((r: Product) => r.slug !== slug).slice(0, 4));
        }
        if (rRes.status === 'fulfilled') setReviews(rRes.value.data.data ?? []);
      } finally { setLoading(false); }
    };
    load();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const activePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.baseCost);
    const activeSku   = selectedVariant ? selectedVariant.sku : product.sku;
    const activeMetal = selectedVariant?.metalType ?? product.metalType;
    const activeCarat = selectedVariant?.carat ?? product.carat ?? undefined;
    addItem({
      productId: product.id,
      title: product.title,
      price: activePrice,
      imageUrl: sortedImages[0]?.url,
      sku: activeSku,
      metalType: activeMetal,
      carat: activeCarat,
      quantity: qty,
      variantId: selectedVariant?.id,
      finishName: selectedVariant?.finishName,
    });
    setAdded(true);
    toast.success(`Added to bag`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-6 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="font-cormorant text-2xl text-ink/30">Product not found</p>
      <button onClick={() => router.back()} className="mt-4 text-sm text-gold hover:underline flex items-center gap-1 mx-auto">
        <ArrowLeft size={14} /> Back
      </button>
    </div>
  );

  const sortedImages = [...product.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = hasVariants && selectedVariant ? Number(selectedVariant.price) : Number(product.baseCost);
  const inStock = hasVariants && selectedVariant ? selectedVariant.stockQty > 0 : product.stockQty > 0;
  const maxQty   = hasVariants && selectedVariant ? selectedVariant.stockQty : product.stockQty;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Collections
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div><ImageGallery images={sortedImages} /></div>

        {/* Product Info */}
        <div className="space-y-6">
          {product.category && <p className="text-gold text-xs uppercase tracking-widest">{product.category.name}</p>}
          <div>
            <h1 className="font-cormorant text-4xl font-light text-ink leading-tight">{product.title}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={avgRating} size={14} />
                <span className="text-xs text-ink-muted">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <p className="font-cormorant text-3xl font-light text-ink">{formatGBP(displayPrice)}</p>
            <span className="text-xs text-ink-muted">incl. VAT</span>
          </div>

          {(product.brand || product.metalType || product.carat || product.weightGrams) && (
            <div className="flex flex-wrap gap-4 text-xs text-ink-muted">
              {product.brand && (
                <span className="flex items-center gap-1">
                  <span className="uppercase tracking-widest text-[10px] text-ink-muted/60">Brand</span>
                  <span className="text-ink font-medium">{product.brand}</span>
                </span>
              )}
              {product.metalType && <span className="uppercase">{product.metalType}</span>}
              {product.carat && <span>{product.carat}</span>}
              {product.weightGrams && <span>{Number(product.weightGrams).toFixed(2)}g</span>}
            </div>
          )}

          <div className="w-8 h-px bg-gold/40" />

          {product.description && (
            <p className="text-sm text-ink-muted leading-relaxed">{product.description}</p>
          )}

          {/* Attributes */}
          {product.attributes.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {product.attributes.map((attr) => (
                <div key={attr.id} className="bg-cream px-3 py-2">
                  <p className="text-[10px] uppercase tracking-widest text-ink-muted">{attr.fieldLabel}</p>
                  <p className="text-sm text-ink font-medium mt-0.5">{attr.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Select a Finish — shown only when variants exist */}
          {hasVariants && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-ink font-medium">Select a Finish</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  // Determine badge color
                  const isGold = v.metalType?.toLowerCase().includes('gold') || v.carat?.toLowerCase().includes('gold') || v.finishName?.toLowerCase().includes('gold') || v.finishName?.toLowerCase().includes('vermeil');
                  return (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setQty(1); }}
                      className={`relative flex flex-col items-center gap-1.5 border p-3 transition-all text-center ${
                        isSelected
                          ? 'border-gold bg-cream'
                          : 'border-gold/20 hover:border-gold/50'
                      }`}
                    >
                      {/* Selected tick */}
                      {isSelected && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                      {/* Metal badge circle */}
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center text-[10px] font-bold leading-tight text-center ${
                        isGold
                          ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-900'
                          : 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 text-gray-700'
                      }`}>
                        {v.badge}
                      </span>
                      <span className="text-xs font-medium text-ink leading-tight">{v.finishName}</span>
                      {v.isPremium && (
                        <span className="text-[9px] uppercase tracking-widest text-gold flex items-center gap-0.5">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M12 2l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 11.1l-3.75 2.6 1.5-4.5L6 6.5h4.5z"/></svg>
                          Premium
                        </span>
                      )}
                      <span className={`text-sm font-medium ${v.isPremium ? 'text-gold' : 'text-ink'}`}>
                        {formatGBP(Number(v.price))}
                      </span>
                      {v.stockQty === 0 && (
                        <span className="text-[9px] uppercase tracking-widest text-danger">Sold out</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-success' : 'bg-danger'}`} />
            <span className="text-xs text-ink-muted">{inStock ? `In stock (${maxQty} available)` : 'Out of stock'}</span>
          </div>

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gold/20">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-cream transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="px-4 py-2 text-sm tabular-nums min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(Math.min(maxQty, qty + 1))} className="px-3 py-2 hover:bg-cream transition-colors">
                    <Plus size={14} />
                  </button>
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
                  className="border border-gold/30 px-4 py-3.5 flex items-center justify-center hover:border-gold transition-colors"
                  aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart size={18} style={{ fill: isWishlisted(product.id) ? '#C9A84C' : 'none', color: isWishlisted(product.id) ? '#C9A84C' : '#888', transition: 'all 0.2s' }} />
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-ink-muted">SKU: {selectedVariant ? selectedVariant.sku : product.sku}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gold/10 mb-8">
        <div className="flex gap-1">
          {([['details', 'Product Details'], ['story', 'The Story'], ['delivery', 'Delivery & Returns']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab ? 'text-gold border-gold' : 'text-ink-muted border-transparent hover:text-ink'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mb-16">
        {activeTab === 'details' && (
          <div className="space-y-3 text-sm text-ink-muted leading-relaxed">
            {product.description && <p>{product.description}</p>}
            <table className="w-full mt-4">
              <tbody>
                {product.brand && (
                  <tr className="border-b border-gold/5">
                    <td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-40">Brand</td>
                    <td className="py-2 text-ink text-sm">{product.brand}</td>
                  </tr>
                )}
                {product.metalType && (
                  <tr className="border-b border-gold/5">
                    <td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-40">Metal</td>
                    <td className="py-2 text-ink text-sm">{product.metalType}</td>
                  </tr>
                )}
                {product.carat && (
                  <tr className="border-b border-gold/5">
                    <td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-40">Carat</td>
                    <td className="py-2 text-ink text-sm">{product.carat}</td>
                  </tr>
                )}
                {product.weightGrams && (
                  <tr className="border-b border-gold/5">
                    <td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-40">Weight</td>
                    <td className="py-2 text-ink text-sm">{Number(product.weightGrams).toFixed(3)}g</td>
                  </tr>
                )}
                {product.attributes.map((a) => (
                  <tr key={a.id} className="border-b border-gold/5">
                    <td className="py-2 pr-8 text-xs uppercase tracking-widest text-ink-muted w-40">{a.fieldLabel}</td>
                    <td className="py-2 text-ink text-sm">{a.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'story' && (
          <p className="text-sm text-ink-muted leading-relaxed">{product.story || 'Each BRM piece is handcrafted by our master goldsmiths in London, using the finest ethically sourced metals. Our commitment to quality means every item is hallmarked and comes with a certificate of authenticity.'}</p>
        )}
        {activeTab === 'delivery' && (
          <div className="space-y-4 text-sm text-ink-muted">
            <div><p className="font-medium text-ink mb-1">Standard Delivery (3–5 days) — Free</p><p>Tracked and insured with Royal Mail Signed For. All UK orders delivered free of charge.</p></div>
            <div><p className="font-medium text-ink mb-1">Express Delivery (1–2 days)</p><p>Next working day on orders placed before 1pm GMT.</p></div>
            <div><p className="font-medium text-ink mb-1">Returns — 30 Days</p><p>Unworn items in original packaging may be returned within 30 days. Bespoke items are non-returnable.</p></div>
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div>
          <div className="flex items-baseline gap-4 mb-6">
            <h2 className="font-cormorant text-2xl font-light text-ink">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size={14} />
              <span className="text-sm text-ink-muted">{avgRating.toFixed(1)} ({reviews.length})</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
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
                {r.body && <p className="text-sm text-ink-muted leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gold/10">
          <h2 className="font-cormorant text-2xl font-light text-ink mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const primaryImage = p.images.find((img) => img.isPrimary) ?? p.images[0];
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  title={p.title}
                  price={Number(p.baseCost)}
                  imageUrl={primaryImage?.url}
                  metalType={p.metalType}
                  carat={p.carat ?? undefined}
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
