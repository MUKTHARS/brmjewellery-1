'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart } from 'lucide-react';
import { formatGBP } from '@/lib/formatCurrency';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl?: string;
  metalType?: string;
  carat?: string;
  category?: string;
  onAddToCart?: () => void;
}

export default function ProductCard({ id, slug, title, price, imageUrl, metalType, carat, category, onAddToCart }: ProductCardProps) {
  const { isWishlisted, toggle } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const wishlisted = isWishlisted(id);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    toggle({ productId: id, slug, title, price, imageUrl, metalType, carat, category });
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  }

  return (
    <div className="group">
      <Link href={`/products/${slug}`} className="block">
        {/* Image */}
        <div className="aspect-square bg-cream overflow-hidden relative mb-3">
          {imageUrl ? (
            <img src={resolveImageUrl(imageUrl)} alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-cormorant text-4xl text-gold/20">BRM</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white transition-colors"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={14}
              style={{ fill: wishlisted ? '#C9A84C' : 'none', color: wishlisted ? '#C9A84C' : '#555', transition: 'all 0.2s' }}
            />
          </button>

          {/* Quick add overlay */}
          {onAddToCart && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button onClick={(e) => { e.preventDefault(); onAddToCart(); }}
                className="w-full bg-ink text-white text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-gold transition-colors">
                <ShoppingBag size={13} /> Add to Bag
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="space-y-0.5">
        {category && <p className="text-[10px] uppercase tracking-widest text-gold">{category}</p>}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-medium text-ink hover:text-gold transition-colors leading-snug line-clamp-2">{title}</h3>
        </Link>
        {(metalType || carat) && (
          <p className="text-xs text-ink-muted">{[metalType, carat].filter(Boolean).join(' · ')}</p>
        )}
        <p className="text-sm font-semibold text-ink tabular-nums">{formatGBP(price)}</p>
      </div>
    </div>
  );
}
