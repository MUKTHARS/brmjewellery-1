'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { metalPriceApi } from '@/api/metalPrice.api';
import { formatGBP } from '@/lib/formatCurrency';

const NAV_LINKS = [
  { href: '/products', label: 'Collections', hasDropdown: true },
  { href: '/bespoke', label: 'Bespoke', hasDropdown: false },
  { href: '/appointments', label: 'Appointments', hasDropdown: false },
  { href: '/about', label: 'About', hasDropdown: false },
  { href: '/contact', label: 'Contact', hasDropdown: false },
];

const METAL_SYMBOL: Record<string, string> = { GOLD: 'Au', SILVER: 'Ag', PLATINUM: 'Pt' };

type MetalPrice = { metal: string; carat?: string; pricePerGramGBP: number };
type Category   = { id: string; name: string; slug: string };

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count } = useCart();

  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [accountOpen,     setAccountOpen]     = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [prices,          setPrices]          = useState<MetalPrice[]>([]);
  const [categories,      setCategories]      = useState<Category[]>([]);

  const accountRef     = useRef<HTMLDivElement>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);

  // Fetch live metal prices
  useEffect(() => {
    metalPriceApi.getCurrent()
      .then((res) => {
        const raw = res.data;
        const list: MetalPrice[] = Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setPrices(list);
      })
      .catch(() => {});
  }, []);

  // Fetch categories for Collections dropdown
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
    fetch(`${base}/api/v1/categories`, { credentials: 'include' })
      .then((r) => r.json())
      .then((json) => setCategories(json.data ?? json ?? []))
      .catch(() => {});
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // One spot price per metal (prefer entry without carat)
  const spotPrices = ['GOLD', 'SILVER', 'PLATINUM'].flatMap((metal) => {
    const entry =
      prices.find((p) => p.metal.toUpperCase() === metal && !p.carat) ??
      prices.find((p) => p.metal.toUpperCase() === metal);
    return entry ? [{ metal, symbol: METAL_SYMBOL[metal], value: entry.pricePerGramGBP }] : [];
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50 }}>

      {/* ── TOP TICKER ── */}
      {prices.length > 0 && (
        <div style={{ backgroundColor: '#000', borderBottom: '1px solid rgba(201,168,76,0.12)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div style={{ flexShrink: 0, backgroundColor: '#C9A84C', padding: '5px 12px', fontSize: '7px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#000', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Live
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', width: 'max-content', animation: 'tickerScroll 28s linear infinite' }}>
              {[...prices, ...prices].map((p, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 18px', borderRight: '1px solid rgba(201,168,76,0.08)', whiteSpace: 'nowrap', fontSize: '9px' }}>
                  <span style={{ color: '#C9A84C', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {p.metal}{p.carat ? ` ${p.carat}` : ''}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.45)' }}>{formatGBP(p.pricePerGramGBP)}/g</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN NAV ── */}
      <div style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: '60px' }}>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '32px', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.35em', color: '#C9A84C', lineHeight: 1 }}>BRM</span>
              <span style={{ fontSize: '6px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.45)', marginTop: '2px' }}>Jewellery</span>
            </Link>

            {/* ── DESKTOP: nav + prices + account ── */}
            <div className="hidden md:flex" style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>

              {/* Nav links */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                {NAV_LINKS.map((link) => {
                  const active = pathname.startsWith(link.href);

                  if (link.hasDropdown) {
                    return (
                      <div
                        key={link.href}
                        ref={collectionsRef}
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setCollectionsOpen(true)}
                        onMouseLeave={() => setCollectionsOpen(false)}
                      >
                        {/* Trigger */}
                        <Link href={link.href} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                          textDecoration: 'none',
                          color: active || collectionsOpen ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                          borderBottom: active ? '1px solid #C9A84C' : '1px solid transparent',
                          paddingBottom: '2px', transition: 'color 0.2s', whiteSpace: 'nowrap',
                        }}>
                          {link.label}
                          <ChevronDown size={9} style={{ transition: 'transform 0.2s', transform: collectionsOpen ? 'rotate(180deg)' : 'none' }} />
                        </Link>

                        {/* Dropdown panel */}
                        {collectionsOpen && categories.length > 0 && (
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 16px)', left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#111',
                            border: '1px solid rgba(201,168,76,0.15)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
                            minWidth: '200px',
                            zIndex: 60,
                          }}>
                            {/* Header row */}
                            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                              <span style={{ fontSize: '7px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)' }}>
                                Shop by Category
                              </span>
                            </div>
                            {/* Category list */}
                            {categories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/products?categoryId=${cat.id}`}
                                onClick={() => setCollectionsOpen(false)}
                                style={{
                                  display: 'block', padding: '10px 16px',
                                  fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
                                  color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
                                  borderBottom: '1px solid rgba(201,168,76,0.06)',
                                  transition: 'color 0.15s, background 0.15s',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C';
                                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(201,168,76,0.05)';
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)';
                                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
                                }}
                              >
                                {cat.name}
                              </Link>
                            ))}
                            {/* View all */}
                            <Link
                              href="/products"
                              onClick={() => setCollectionsOpen(false)}
                              style={{
                                display: 'block', padding: '10px 16px',
                                fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                                color: '#C9A84C', textDecoration: 'none',
                                transition: 'background 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(201,168,76,0.07)'}
                              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'}
                            >
                              View All Collections →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link key={link.href} href={link.href} style={{
                      fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase',
                      textDecoration: 'none',
                      color: active ? '#C9A84C' : 'rgba(255,255,255,0.5)',
                      borderBottom: active ? '1px solid #C9A84C' : '1px solid transparent',
                      paddingBottom: '2px', transition: 'color 0.2s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Spot prices + Account */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>

                {spotPrices.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px', paddingRight: '20px', borderRight: '1px solid rgba(201,168,76,0.15)' }}>
                    {spotPrices.map((sp, i) => (
                      <div key={sp.metal} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', borderRight: i < spotPrices.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none' }}>
                        <span style={{ fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>
                          {sp.symbol} · {sp.metal.charAt(0) + sp.metal.slice(1).toLowerCase()}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: '#C9A84C', letterSpacing: '0.03em' }}>
                          {formatGBP(sp.value)}<span style={{ fontSize: '7px', color: 'rgba(201,168,76,0.5)', marginLeft: '2px' }}>/g</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Account */}
                {user ? (
                  <div ref={accountRef} style={{ position: 'relative', marginRight: '16px' }}>
                    <button onClick={() => setAccountOpen(!accountOpen)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                      <User size={13} />
                      <span style={{ maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.firstName}</span>
                      <ChevronDown size={10} style={{ transition: 'transform 0.2s', transform: accountOpen ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {accountOpen && (
                      <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 10px)', minWidth: '160px', backgroundColor: '#111', border: '1px solid rgba(201,168,76,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', zIndex: 60 }}>
                        {[{ href: '/account', label: 'My Account' }, { href: '/account/orders', label: 'My Orders' }].map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setAccountOpen(false)}
                            style={{ display: 'block', padding: '10px 14px', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,0.07)', transition: 'color 0.2s, background 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(201,168,76,0.05)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)'; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; }}>
                            {item.label}
                          </Link>
                        ))}
                        {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                          <Link href="/admin" onClick={() => setAccountOpen(false)}
                            style={{ display: 'block', padding: '10px 14px', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,0.07)', transition: 'background 0.2s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(201,168,76,0.05)'}
                            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'}>
                            Admin Panel
                          </Link>
                        )}
                        <button onClick={() => { setAccountOpen(false); logout(); }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '16px', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'}>
                    <User size={13} /> Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* ── ALWAYS VISIBLE: single Cart + mobile hamburger ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }} className="md:ml-4">
              <Link href="/cart" style={{ position: 'relative', display: 'flex', flexShrink: 0 }}>
                <ShoppingBag size={18} style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as SVGElement).style.color = '#C9A84C'}
                  onMouseLeave={e => (e.currentTarget as SVGElement).style.color = 'rgba(255,255,255,0.7)'}
                />
                {count > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-6px', width: '15px', height: '15px', backgroundColor: '#C9A84C', color: '#000', fontSize: '8px', fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex' }}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileOpen && (
        <div className="md:hidden" style={{ backgroundColor: '#0d0d0d', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '16px 24px 20px' }}>
          <nav>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '11px 0', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: pathname.startsWith(link.href) ? '#C9A84C' : 'rgba(255,255,255,0.5)', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,0.06)' }}>
                {link.label}
              </Link>
            ))}
            {/* Categories under Collections on mobile */}
            {categories.length > 0 && (
              <div style={{ paddingLeft: '12px', borderLeft: '1px solid rgba(201,168,76,0.15)', marginTop: '2px' }}>
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/products?categoryId=${cat.id}`} onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '8px 0', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,0.04)' }}>
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
            {user ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '9px 0', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>My Account</Link>
                <Link href="/account/orders" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '9px 0', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>My Orders</Link>
                <button onClick={() => { setMobileOpen(false); logout(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '9px 0', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Sign Out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '9px 0', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Sign In</Link>
            )}
          </div>

          {spotPrices.length > 0 && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
              <p style={{ fontSize: '7px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '10px' }}>Live Spot Prices</p>
              <div style={{ display: 'flex', gap: '0' }}>
                {spotPrices.map((sp, i) => (
                  <div key={sp.metal} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRight: i < spotPrices.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none' }}>
                    <p style={{ fontSize: '7px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>{sp.symbol} {sp.metal.charAt(0) + sp.metal.slice(1).toLowerCase()}</p>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#C9A84C' }}>{formatGBP(sp.value)}<span style={{ fontSize: '8px', color: 'rgba(201,168,76,0.5)' }}>/g</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </header>
  );
}
