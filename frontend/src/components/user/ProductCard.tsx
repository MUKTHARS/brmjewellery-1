import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatGBP } from '@/lib/formatCurrency';

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

export default function ProductCard({ slug, title, price, imageUrl, metalType, carat, category, onAddToCart }: ProductCardProps) {
  return (
    <div className="group">
      <Link href={`/products/${slug}`} className="block">
        {/* Image */}
        <div className="aspect-square bg-cream overflow-hidden relative mb-3">
          {imageUrl ? (
            <img src={imageUrl} alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-cormorant text-4xl text-gold/20">BRM</span>
            </div>
          )}
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
