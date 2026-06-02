import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Award, BadgeCheck } from 'lucide-react';
import HeroCarousel from '@/components/user/HeroCarousel';
import { metalPriceApi } from '@/api/metalPrice.api';
import { formatGBP } from '@/lib/formatCurrency';
import ShopByCategory from '@/components/user/ShopByCategory';
import NewArrivals from '@/components/user/NewArrivals';

async function getData() {
  try {
    const pricesRes = await metalPriceApi.getCurrent();
    const raw = pricesRes.data;
    const prices = Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return { prices };
  } catch { return { prices: [] }; }
}

export default async function HomePage() {
  const { prices } = await getData();

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff' }}>

      {/* ── KLARNA STRIP ── */}
      <div style={{
        backgroundColor: '#f5dce3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '12px', padding: '1px 24px',
      }}>
        <img
          src="/assets/Klarna-logo.png"
          alt="Klarna"
          style={{ height: '44px', width: 'auto', display: 'block' }}
        />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.01em' }}>
          Buy now, pay later — 3 interest-free instalments
        </span>
      </div>

      {/* ── LIVE PRICE TICKER ── */}
      {prices.length > 0 && (
        <div style={{ backgroundColor: '#000', borderBottom: '1px solid rgba(201,168,76,0.2)' }}
          className="text-xs py-2 overflow-hidden">
          <div className="flex gap-10 px-6 whitespace-nowrap overflow-x-auto">
            {prices.slice(0, 6).map((p: { metal: string; carat?: string; pricePerGramGBP: number }) => (
              <span key={`${p.metal}-${p.carat}`} className="flex-shrink-0">
                <span style={{ color: '#C9A84C' }} className="font-medium uppercase">
                  {p.metal}{p.carat ? ` ${p.carat}` : ''}
                </span>
                <span className="ml-2 text-white/50">{formatGBP(p.pricePerGramGBP)}/g</span>
              </span>
            ))}
            <span className="flex-shrink-0 text-white/20">· Live spot prices · Updated every 6 min ·</span>
          </div>
        </div>
      )}

      {/* ── HERO CAROUSEL ── */}
      <HeroCarousel />

      {/* ── STATS BAR ── */}
      <section style={{ backgroundColor: '#111', borderTop: '1px solid rgba(201,168,76,0.15)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }} className="divide-x divide-gold/10">
            {[
              { value: '5,000+', label: 'Pieces Crafted' },
              { value: '20+', label: 'Years of Craft' },
              { value: '100%', label: 'Hallmarked' },
              { value: '5★', label: 'Rated Excellent' },
            ].map(({ value, label }) => (
              <div key={label} style={{ padding: '28px 20px', textAlign: 'center' }}>
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '2.2rem', fontWeight: 300, color: '#C9A84C', lineHeight: 1,
                  marginBottom: '6px',
                }}>{value}</p>
                <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <ShopByCategory />


      {/* ── WHY CHOOSE BRM ── */}
      <section style={{ backgroundColor: '#0d0d0d', padding: '80px 0', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Our Promise
            </p>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 300, color: '#fff', letterSpacing: '0.04em',
            }}>
              Why Choose BRM Jewellery
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', backgroundColor: 'rgba(201,168,76,0.1)' }}>
            {[
              {
                icon: BadgeCheck,
                title: 'Price Guarantee',
                desc: 'We guarantee the best price for your bespoke commission — transparent, no hidden costs.',
              },
              {
                icon: ShieldCheck,
                title: 'Hallmarked & Certified',
                desc: 'Every piece is hallmarked by the London Assay Office. World-class gold standards guaranteed.',
              },
              {
                icon: Award,
                title: 'Bespoke Service',
                desc: 'Commission one-of-a-kind jewellery crafted to your exact specifications by master goldsmiths.',
              },
              {
                icon: Star,
                title: '5 Star Reviews',
                desc: 'Rated Excellent by our clients. Over 5,000 pieces crafted and trusted across the UK.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                backgroundColor: '#0d0d0d', padding: '48px 36px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '56px', height: '56px', border: '1px solid rgba(201,168,76,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '8px',
                }}>
                  <Icon size={22} style={{ color: '#C9A84C' }} />
                </div>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.25rem', fontWeight: 400, color: '#fff', letterSpacing: '0.03em',
                }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '220px' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE / STORY ── */}
      <section style={{ backgroundColor: '#060606', padding: '80px 0', borderTop: '1px solid rgba(201,168,76,0.12)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div style={{ position: 'relative' }}>
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                <img
                  src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=900&q=80"
                  alt="BRM Jewellery workshop"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.05) 0%, transparent 60%)',
                }} />
              </div>
              {/* floating stat card */}
              <div style={{
                position: 'absolute', bottom: '-24px', right: '-20px',
                backgroundColor: '#C9A84C', padding: '24px 28px', minWidth: '160px',
              }} className="hidden md:block">
                <p style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '2.5rem', fontWeight: 300, color: '#000', lineHeight: 1,
                }}>20+</p>
                <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#000', opacity: 0.7, marginTop: '4px' }}>
                  Years of craft
                </p>
              </div>
            </div>

            <div style={{ paddingLeft: '0' }} className="md:pl-8">
              <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Our Story
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 300, color: '#fff',
                letterSpacing: '0.04em', marginBottom: '24px', lineHeight: 1.2,
              }}>
                UK's Leading<br />Fine Jewellers
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.9 }}>
                <p>
                  BRM Jewellery was founded in the heart of Hatton Garden — London's historic jewellery quarter — by master goldsmiths with decades of experience crafting fine jewellery for discerning clients across the United Kingdom.
                </p>
                <p>
                  We work exclusively with ethically sourced precious metals and certified gemstones. All our pieces are hallmarked by the London Assay Office, guaranteeing their authenticity and quality for generations to come.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px', marginTop: '40px' }}>
                {[
                  { value: '5,000+', label: 'Pieces made' },
                  { value: '100%', label: 'Hallmarked' },
                  { value: '20+', label: 'Years of craft' },
                ].map(({ value, label }) => (
                  <div key={label} style={{ borderTop: '1px solid rgba(201,168,76,0.25)', paddingTop: '16px' }}>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '2rem', fontWeight: 300, color: '#C9A84C',
                    }}>{value}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '4px' }}>{label}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '36px' }}>
                <Link href="/about" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C',
                  padding: '12px 28px', fontSize: '10px', letterSpacing: '0.2em',
                  textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.3s',
                }}>
                  LEARN MORE <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BESPOKE FULL-WIDTH BANNER ── */}
      <section style={{
        position: 'relative', padding: '100px 24px',
        background: 'linear-gradient(135deg, #0a0800 0%, #1a1000 50%, #0a0800 100%)',
        borderTop: '1px solid rgba(201,168,76,0.2)', borderBottom: '1px solid rgba(201,168,76,0.2)',
        textAlign: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', margin: '0 auto 24px' }} />
          <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Commission
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 300, color: '#fff',
            letterSpacing: '0.04em', marginBottom: '20px', lineHeight: 1.2,
          }}>
            Something Truly Unique
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1.9, marginBottom: '36px' }}>
            Commission a one-of-a-kind piece crafted to your exact specifications.<br />
            Our master goldsmiths bring your vision to life.
          </p>
          <Link href="/bespoke" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            backgroundColor: '#C9A84C', color: '#000',
            padding: '14px 36px', fontSize: '11px',
            letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600,
            textDecoration: 'none',
          }}>
            START YOUR BESPOKE JOURNEY <ArrowRight size={14} />
          </Link>
        </div>
        <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', margin: '24px auto 0' }} />
      </section>

      {/* ── NEW ARRIVALS ── */}
      <NewArrivals />

      {/* ── VISIT / APPOINTMENT ── */}
      <section style={{ backgroundColor: '#0a0a0a', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{
            border: '1px solid rgba(201,168,76,0.2)',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            overflow: 'hidden',
          }} className="grid-cols-1 md:grid-cols-2">
            {/* left */}
            <div style={{ padding: '56px 48px', borderRight: '1px solid rgba(201,168,76,0.15)' }}>
              <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '16px' }}>Visit Us</p>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '2rem', fontWeight: 300, color: '#fff', letterSpacing: '0.04em', marginBottom: '20px',
              }}>Book a Private Appointment</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: 1.9, marginBottom: '32px' }}>
                Experience our collections in person. Our expert team is here to help you find the perfect piece or guide your bespoke commission.
              </p>
              <Link href="/appointments" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1px solid #C9A84C', color: '#C9A84C',
                padding: '12px 28px', fontSize: '10px', letterSpacing: '0.2em',
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                RESERVE YOUR APPOINTMENT <ArrowRight size={12} />
              </Link>
            </div>
            {/* right */}
            <div style={{ padding: '56px 48px', backgroundColor: '#080808' }}>
              <p style={{ color: '#C9A84C', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '20px' }}>Our Workshop</p>
              <address style={{ fontStyle: 'normal', fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 2 }}>
                <p style={{ color: '#fff', fontWeight: 500, marginBottom: '8px' }}>BRM Jewellery Ltd</p>
                <p>3 Selkirk Road</p>
                <p>London, England, SW17 0ER</p>
                <p>United Kingdom</p>
                <p style={{ marginTop: '16px' }}>
                  <a href="tel:+442071234567" className="text-white/50 no-underline hover:text-[#C9A84C] transition-colors">
                    +44 (0)20 7123 4567
                  </a>
                </p>
                <p>
                  <a href="mailto:support@brmjewellery.co.uk" className="text-white/50 no-underline hover:text-[#C9A84C] transition-colors">
                    support@brmjewellery.co.uk
                  </a>
                </p>
                <p style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                  Mon – Sat: 10:00 – 18:00 · Sun: By appointment
                </p>
              </address>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
