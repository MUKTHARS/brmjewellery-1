'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { productApi } from '@/api/product.api';
import ProductCard from '@/components/user/ProductCard';

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
    productApi.getAll({ limit: 4 })
      .then((res) => {
        const data: Product[] = res.data.data ?? res.data ?? [];
        setProducts(data.slice(0, 4));
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

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const primaryImage = p.images?.find((img) => img.isPrimary) ?? p.images?.[0];
            return (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                title={p.title}
                price={Number(p.baseCost)}
                imageUrl={primaryImage?.url}
                metalType={p.metalType ?? undefined}
                carat={p.carat ?? undefined}
                category={p.category?.name}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
