import Link from 'next/link';

const CATEGORIES = [
  {
    name: 'Rings',
    slug: 'rings',
    href: '/products?category=rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    label: 'Shop Rings',
  },
  {
    name: 'Chains & Necklaces',
    slug: 'chains-necklaces',
    href: '/products?category=chains-necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    label: 'Shop Necklaces',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    href: '/products?category=bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    label: 'Shop Bracelets',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    href: '/products?category=earrings',
    image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800&q=80',
    label: 'Shop Earrings',
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    href: '/products?category=pendants',
    image: 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=800&q=80',
    label: 'Shop Pendants',
  },
];

export default function ShopByCategory() {
  return (
    <section
      style={{
        backgroundColor: '#0a0a0a',
        padding: '80px 0',
        borderTop: '1px solid rgba(201,168,76,0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p
            style={{
              color: '#C9A84C',
              fontSize: '10px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Browse Our Collections
          </p>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 300,
              color: '#fff',
              letterSpacing: '0.04em',
              lineHeight: 1.1,
            }}
          >
            Shop By Category
          </h2>
          <div
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: '#C9A84C',
              margin: '20px auto 0',
              opacity: 0.5,
            }}
          />
        </div>

        {/* Category Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
          }}
          className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.href}
              style={{
                position: 'relative',
                display: 'block',
                textDecoration: 'none',
                overflow: 'hidden',
                aspectRatio: '3/4',
                backgroundColor: '#111',
              }}
              className="group"
            >
              {/* Category Image */}
              <img
                src={cat.image}
                alt={cat.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.7s ease',
                  filter: 'brightness(0.7)',
                }}
                className="group-hover:scale-110 group-hover:brightness-50"
              />

              {/* Gold border on hover */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '1px solid transparent',
                  transition: 'border-color 0.3s ease',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
                className="group-hover:border-[rgba(201,168,76,0.6)]"
              />

              {/* Gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.05) 100%)',
                  zIndex: 1,
                }}
              />

              {/* Category info */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '24px 16px',
                  gap: '12px',
                  zIndex: 3,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: '1.25rem',
                    fontWeight: 300,
                    color: '#fff',
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </p>

                {/* CTA button — slides up on hover */}
                <span
                  style={{
                    display: 'inline-block',
                    border: '1px solid rgba(201,168,76,0.75)',
                    color: '#C9A84C',
                    padding: '7px 18px',
                    fontSize: '8px',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'transparent',
                    opacity: 0,
                    transform: 'translateY(6px)',
                  }}
                  className="group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-[#C9A84C] group-hover:text-black group-hover:border-[#C9A84C]"
                >
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* View All link */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(201,168,76,0.35)',
              color: '#C9A84C',
              padding: '12px 32px',
              fontSize: '9px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            className="hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C]"
          >
            VIEW ALL COLLECTIONS
          </Link>
        </div>
      </div>
    </section>
  );
}
