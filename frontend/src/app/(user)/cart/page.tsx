'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatGBP } from '@/lib/formatCurrency';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

const VAT_RATE = 0.2;

export default function CartPage() {
  const router = useRouter();
  const { items, count, subtotal, updateQuantity, removeItem } = useCart();

  const vatAmount = parseFloat((subtotal * VAT_RATE).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));

  if (count === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <ShoppingBag size={48} className="text-gold/20 mx-auto mb-4" />
      <h1 className="font-cormorant text-3xl font-light text-ink mb-3">Your Bag is Empty</h1>
      <p className="text-sm text-ink-muted mb-8">Discover our handcrafted collections</p>
      <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-8 py-3">
        Explore Collections <ArrowRight size={16} />
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-cormorant text-4xl font-light text-ink">Your Bag</h1>
        <p className="text-sm text-ink-muted mt-1">{count} {count === 1 ? 'item' : 'items'}</p>
        <div className="w-16 h-px bg-gold mt-4" />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border border-gold/10 p-4">
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0 bg-cream overflow-hidden">
                {item.imageUrl ? (
                  <img src={resolveImageUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-cormorant text-xl text-gold/20">BRM</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <div>
                    <Link href={`/products/${item.sku}`} className="text-sm font-medium text-ink hover:text-gold transition-colors line-clamp-2">{item.title}</Link>
                    {/* Finish badge — shown when a variant is selected */}
                    {item.finishName && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-widest bg-cream border border-gold/20 text-ink px-2 py-0.5">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
                          background: item.metalType?.toUpperCase() === 'GOLD'
                            ? 'linear-gradient(135deg,#f5d97a,#C9A84C,#a8782a)'
                            : 'linear-gradient(135deg,#e8e8e8,#c8c8c8,#a0a0a0)',
                        }} />
                        {item.finishName}
                      </span>
                    )}
                    {!item.finishName && (item.metalType || item.carat) && (
                      <p className="text-xs text-ink-muted mt-0.5">{[item.metalType, item.carat].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-ink-muted hover:text-danger transition-colors ml-3 flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gold/20">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2.5 py-1.5 hover:bg-cream transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="px-3 py-1.5 text-xs tabular-nums">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2.5 py-1.5 hover:bg-cream transition-colors">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatGBP(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border border-gold/10 p-6 sticky top-24">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal (excl. VAT)</span>
                <span className="tabular-nums">{formatGBP(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">VAT (20%)</span>
                <span className="tabular-nums">{formatGBP(vatAmount)}</span>
              </div>
              <div className="border-t border-gold/10 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums text-lg">{formatGBP(total)}</span>
              </div>
            </div>

            <button onClick={() => router.push('/checkout')} className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link href="/products" className="block text-center text-xs text-ink-muted hover:text-gold mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
