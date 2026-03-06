import Link from 'next/link';
import { ArrowRight, Gem, Shield, Truck, RotateCcw } from 'lucide-react';
import { productApi } from '@/api/product.api';
import { categoryApi } from '@/api/category.api';
import { metalPriceApi } from '@/api/metalPrice.api';
import ProductCard from '@/components/user/ProductCard';
import { formatGBP } from '@/lib/formatCurrency';

async function getData() {
  try {
    const [productsRes, categoriesRes, pricesRes] = await Promise.allSettled([
      productApi.getAll({ limit: 8, isActive: 'true' }),
      categoryApi.getAll({ isActive: true }),
      metalPriceApi.getAll(),
    ]);
    return {
      products: productsRes.status === 'fulfilled' ? (productsRes.value.data.data ?? []) : [],
      categories: categoriesRes.status === 'fulfilled' ? (categoriesRes.value.data.data ?? []) : [],
      prices: pricesRes.status === 'fulfilled' ? (pricesRes.value.data.data ?? []) : [],
    };
  } catch { return { products: [], categories: [], prices: [] }; }
}

const CATEGORY_IMAGES: Record<string, string> = {
  rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
  'chains-necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  bracelets: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  earrings: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
  pendants: 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&q=80',
};

export default async function HomePage() {
  const { products, categories, prices } = await getData();

  const priceMap: Record<string, number> = {};
  prices.forEach((p: { metal: string; carat?: string; pricePerGramGBP: number }) => {
    const key = p.carat ? `${p.metal}-${p.carat}` : p.metal;
    priceMap[key] = p.pricePerGramGBP;
  });

  return (
    <div>
      {/* Metal Price Ticker */}
      {prices.length > 0 && (
        <div className="bg-ink text-white/70 text-xs py-2 overflow-hidden">
          <div className="flex gap-8 px-4 animate-none whitespace-nowrap overflow-x-auto scrollbar-hide">
            {prices.slice(0, 6).map((p: { metal: string; carat?: string; pricePerGramGBP: number }) => (
              <span key={`${p.metal}-${p.carat}`} className="flex-shrink-0">
                <span className="text-gold font-medium">{p.metal}{p.carat ? ` ${p.carat}` : ''}</span>
                <span className="ml-2">{formatGBP(p.pricePerGramGBP)}/g</span>
              </span>
            ))}
            <span className="flex-shrink-0 text-white/30">Live spot prices · Updated every 6 min</span>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-ink min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/95 to-gold/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-xl">
            <p className="text-gold text-xs uppercase tracking-[0.4em] mb-6">Handcrafted in London</p>
            <h1 className="font-cormorant text-5xl md:text-7xl font-light text-white leading-tight mb-6">
              Where Precious<br />Metals Meet<br /><em className="text-gold">Artistry</em>
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-10 max-w-sm">
              Each piece is crafted to order using ethically sourced gold, silver, and platinum. Hallmarked and certified.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-8 py-3">
                Explore Collections <ArrowRight size={16} />
              </Link>
              <Link href="/bespoke" className="inline-flex items-center gap-2 px-8 py-3 border border-white/30 text-white text-sm uppercase tracking-widest hover:border-gold hover:text-gold transition-colors">
                Create Bespoke
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <div className="w-px h-10 bg-white/20" />
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-gold/10 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Gem, label: 'Hallmarked', sub: 'Assay Office certified' },
              { icon: Shield, label: 'Authentic', sub: 'Ethically sourced metals' },
              { icon: Truck, label: 'Free Delivery', sub: 'On all UK orders' },
              { icon: RotateCcw, label: '30-Day Returns', sub: 'Hassle-free exchanges' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon size={20} className="text-gold" />
                <p className="text-xs font-medium text-ink uppercase tracking-widest">{label}</p>
                <p className="text-xs text-ink-muted">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p className="text-gold text-xs uppercase tracking-widest mb-2">Shop by Collection</p>
            <h2 className="font-cormorant text-4xl font-light text-ink">Our Collections</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((cat: { id: string; name: string; slug: string }) => (
              <Link key={cat.id} href={`/products?categoryId=${cat.id}`}
                className="group block aspect-[3/4] relative overflow-hidden bg-cream">
                {CATEGORY_IMAGES[cat.slug] ? (
                  <img src={CATEGORY_IMAGES[cat.slug]} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-cream">
                    <span className="font-cormorant text-4xl text-gold/30">BRM</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-cormorant text-xl font-light">{cat.name}</p>
                  <p className="text-white/60 text-xs mt-0.5 group-hover:text-gold transition-colors flex items-center gap-1">
                    Shop now <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="bg-cream py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2">New Arrivals</p>
                <h2 className="font-cormorant text-4xl font-light text-ink">Featured Pieces</h2>
              </div>
              <Link href="/products" className="text-sm text-ink-muted hover:text-gold transition-colors flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p: { id: string; slug: string; title: string; baseCost: number; metalType?: string; carat?: string; images?: { url: string }[]; category?: { name: string } }) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  title={p.title}
                  price={Number(p.baseCost)}
                  imageUrl={p.images?.[0]?.url}
                  metalType={p.metalType ?? undefined}
                  carat={p.carat ?? undefined}
                  category={p.category?.name}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Who We Are */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="font-cormorant text-4xl font-light text-ink mb-6">Who We Are</h2>
              <div className="space-y-4 text-sm text-ink-muted leading-relaxed">
                <p>
                  BRM Jewellery was founded in the heart of Hatton Garden — London's historic jewellery quarter — by master goldsmiths with decades of experience crafting fine jewellery for discerning clients across the United Kingdom.
                </p>
                <p>
                  Every piece we create begins with a conversation. Whether you're choosing from our curated collections or commissioning something entirely bespoke, we take time to understand what you want to express — and then we bring it to life with uncompromising craftsmanship.
                </p>
                <p>
                  We work exclusively with ethically sourced precious metals and certified gemstones. All our pieces are hallmarked by the London Assay Office, guaranteeing their authenticity and quality for generations to come.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { value: '20+', label: 'Years of craft' },
                  { value: '5,000+', label: 'Pieces made' },
                  { value: '100%', label: 'Hallmarked' },
                ].map(({ value, label }) => (
                  <div key={label} className="border-t border-gold/20 pt-4">
                    <p className="font-cormorant text-3xl font-light text-ink">{value}</p>
                    <p className="text-xs text-ink-muted uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="aspect-[4/3] overflow-hidden bg-cream">
                <img
                  src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80"
                  alt="BRM Jewellery workshop"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="border border-gold/20 p-6 bg-cream">
                <p className="text-gold text-xs uppercase tracking-widest mb-3">Visit Our Workshop</p>
                <address className="not-italic text-sm text-ink-muted space-y-1.5">
                  <p className="text-ink font-medium">BRM Jewellery Ltd</p>
                  <p>Hatton Garden</p>
                  <p>London, EC1N 8HN</p>
                  <p>United Kingdom</p>
                  <p className="pt-2">
                    <a href="tel:+442071234567" className="hover:text-gold transition-colors">+44 (0)20 7123 4567</a>
                  </p>
                  <p>
                    <a href="mailto:hello@brmjewellery.co.uk" className="hover:text-gold transition-colors">hello@brmjewellery.co.uk</a>
                  </p>
                  <p className="pt-2 text-xs text-ink-muted/70">Mon – Sat: 10:00 – 18:00 · Sun: By appointment</p>
                </address>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke CTA */}
      <section className="bg-ink py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <h2 className="font-cormorant text-4xl font-light text-white mb-4">
            Something Truly Unique
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            Commission a one-of-a-kind piece crafted to your exact specifications. Our master goldsmiths bring your vision to life.
          </p>
          <Link href="/bespoke" className="btn-gold inline-flex items-center gap-2 px-8 py-3">
            Start Your Bespoke Journey <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Appointment CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-gold/20 p-10 text-center">
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Visit Us</p>
            <h2 className="font-cormorant text-3xl font-light text-ink mb-4">Book a Private Appointment</h2>
            <p className="text-ink-muted text-sm max-w-md mx-auto mb-6">
              Experience our collections in person. Our team is here to help you find the perfect piece.
            </p>
            <Link href="/appointments" className="btn-outline-gold inline-flex items-center gap-2 px-6 py-2.5 text-sm">
              Reserve Your Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
