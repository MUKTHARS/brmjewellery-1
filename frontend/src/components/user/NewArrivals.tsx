'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { formatGBP } from '@/lib/formatCurrency';
import { resolveImageUrl } from '@/lib/resolveImageUrl';

type Product = {
  id: string;
  slug: string;
  title: string;
  baseCost: number;
  metalType?: string;
  carat?: string;
  images?: { url: string; isPrimary?: boolean }[];
  category?: { name: string };
};

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
    fetch(`${base}/api/v1/products?limit=4`, { credentials: 'include' })
      .then((r) => r.json())
      .then(async (json) => {
        const list: Product[] = json.data ?? json ?? [];
        const slugs = list.slice(0, 4).map((p) => p.slug);
        const details = await Promise.all(
          slugs.map((slug) =>
            fetch(`${base}/api/v1/products/slug/${slug}`, { credentials: 'include' })
              .then((r) => r.json())
              .then((j) => j.data as Product)
              .catch(() => null)
          )
        );
        setProducts(details.filter(Boolean) as Product[]);
      })
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      style={{
        backgroundColor: '#060606',
        padding: '80px 0',
        borderTop: '1px solid rgba(201,168,76,0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '48px',
          }}
        >
          <div>
            <p
              style={{
                color: '#C9A84C',
                fontSize: '10px',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Just In
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                fontWeight: 300,
                color: '#fff',
                letterSpacing: '0.04em',
              }}
            >
              New Arrivals
            </h2>
          </div>

          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#C9A84C',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(201,168,76,0.4)',
              paddingBottom: '2px',
            }}
          >
            VIEW ALL <ArrowRight size={12} />
          </Link>
        </div>

        {/* Dark Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const primaryImage = p.images?.find((img) => img.isPrimary) ?? p.images?.[0];
            const imageUrl = resolveImageUrl(primaryImage?.url);
            const meta = [p.metalType, p.carat].filter(Boolean).join(' · ');
            return (
              <div key={p.id} className="group" style={{ cursor: 'pointer' }}>
                {/* Image */}
                <Link href={`/products/${p.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      backgroundColor: '#111',
                      overflow: 'hidden',
                      position: 'relative',
                      marginBottom: '14px',
                      border: '1px solid rgba(201,168,76,0.08)',
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.5s ease', padding: '12px' }}
                        className="group-hover:scale-105"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', color: 'rgba(201,168,76,0.15)' }}>BRM</span>
                      </div>
                    )}
                    {/* Quick add overlay */}
                    <div
                      className="translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                    >
                      <button
                        onClick={(e) => e.preventDefault()}
                        style={{
                          width: '100%',
                          backgroundColor: '#C9A84C',
                          color: '#000',
                          fontSize: '10px',
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        <ShoppingBag size={12} /> Add to Bag
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {p.category?.name && (
                    <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>
                      {p.category.name}
                    </p>
                  )}
                  <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '1rem',
                        fontWeight: 400,
                        color: '#fff',
                        margin: 0,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.2s',
                      }}
                      className="group-hover:text-[#C9A84C]"
                    >
                      {p.title}
                    </h3>
                  </Link>
                  {meta && (
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.05em' }}>
                      {meta}
                    </p>
                  )}
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#C9A84C', margin: 0, letterSpacing: '0.03em' }}>
                    {formatGBP(Number(p.baseCost))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
