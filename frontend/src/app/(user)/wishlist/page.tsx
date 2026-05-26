'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatGBP } from '@/lib/formatCurrency';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { items, removeItem, count } = useWishlist();
  const { addItem } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/wishlist');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  function moveToCart(item: typeof items[number]) {
    addItem({
      productId: item.productId,
      title: item.title,
      sku: item.slug,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
      metalType: item.metalType,
      carat: item.carat,
    });
    removeItem(item.productId);
    toast.success('Moved to bag');
  }

  if (count === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <Heart size={48} className="mx-auto mb-4" style={{ color: 'rgba(201,168,76,0.2)' }} />
      <h1 className="font-cormorant text-3xl font-light text-ink mb-3">Your Wishlist is Empty</h1>
      <p className="text-sm text-ink-muted mb-8">Save pieces you love and come back to them anytime</p>
      <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-8 py-3">
        Explore Collections <ArrowRight size={16} />
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-light text-ink">Your Wishlist</h1>
        <p className="text-sm text-ink-muted mt-1">{count} {count === 1 ? 'item' : 'items'} saved</p>
        <div className="w-16 h-px bg-gold mt-4" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.productId} className="group border border-gold/10 flex flex-col">
            {/* Image */}
            <Link href={`/products/${item.slug}`} className="block relative overflow-hidden aspect-square bg-cream">
              {item.imageUrl ? (
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-cormorant text-4xl text-gold/20">BRM</span>
                </div>
              )}
              {/* Remove button overlay */}
              <button
                onClick={(e) => { e.preventDefault(); removeItem(item.productId); toast.success('Removed from wishlist'); }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white transition-colors"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={13} className="text-ink-muted" />
              </button>
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 gap-1">
              {item.category && (
                <p className="text-[10px] uppercase tracking-widest text-gold">{item.category}</p>
              )}
              <Link href={`/products/${item.slug}`}>
                <h3 className="text-sm font-medium text-ink hover:text-gold transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>
              </Link>
              {(item.metalType || item.carat) && (
                <p className="text-xs text-ink-muted">{[item.metalType, item.carat].filter(Boolean).join(' · ')}</p>
              )}
              <p className="text-sm font-semibold text-ink tabular-nums mt-auto pt-2">{formatGBP(item.price)}</p>

              <button
                onClick={() => moveToCart(item)}
                className="mt-2 w-full btn-gold py-2.5 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                <ShoppingBag size={13} /> Add to Bag
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
