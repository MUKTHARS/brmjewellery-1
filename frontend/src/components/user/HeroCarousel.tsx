'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   SLIDE 1 — Full-bleed, text bottom, billboard style
───────────────────────────────────────────────────────────── */
function Slide1({ out }: { out: boolean }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh', minHeight: '600px',
      display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
    }}>
      <img
        src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1800&q=90"
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'brightness(0.55) saturate(0.85)',
          opacity: out ? 0 : 1, transform: out ? 'scale(1.04)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 10, width: '100%',
        padding: '0 60px 64px',
        opacity: out ? 0 : 1, transform: out ? 'translateY(18px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '40px', flexWrap: 'wrap',
        }}>
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
              <span style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
                Handcrafted in London · Est. 2004
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.6rem, 6vw, 5.5rem)', fontWeight: 300,
              lineHeight: 1.05, letterSpacing: '0.02em', color: '#fff', marginBottom: '14px',
            }}>
              Where Precious<br />
              Metals Meet <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Artistry</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.85, maxWidth: '400px' }}>
              Every piece hallmarked by the London Assay Office — ethically sourced, crafted to order.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <Link href="/products" style={{
              backgroundColor: '#C9A84C', color: '#000',
              padding: '14px 34px', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase', fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
            }}>
              SHOP NOW <ArrowRight size={13} />
            </Link>
            <Link href="/bespoke" style={{
              border: '1px solid rgba(201,168,76,0.55)', color: '#C9A84C',
              padding: '14px 34px', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              justifyContent: 'center',
            }}>
              BESPOKE
            </Link>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5) 30%, rgba(201,168,76,0.5) 70%, transparent)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 2 — Full-bleed, text bottom, billboard style
───────────────────────────────────────────────────────────── */
function Slide2({ out }: { out: boolean }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh', minHeight: '600px',
      display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
    }}>
      <img
        src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&q=90"
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'brightness(0.55) saturate(0.85)',
          opacity: out ? 0 : 1, transform: out ? 'scale(1.04)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 10, width: '100%',
        padding: '0 60px 64px',
        opacity: out ? 0 : 1, transform: out ? 'translateY(18px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '40px', flexWrap: 'wrap',
        }}>
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
              <span style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
                New Collection · 2025
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.6rem, 6vw, 5.5rem)', fontWeight: 300,
              lineHeight: 1.05, letterSpacing: '0.02em', color: '#fff', marginBottom: '14px',
            }}>
              Fine Jewellery<br />
              Crafted with <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Precision</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.85, maxWidth: '400px' }}>
              Bespoke commissions and curated collections — hallmarked by the London Assay Office. Each piece begins with a conversation.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <Link href="/products" style={{
              backgroundColor: '#C9A84C', color: '#000',
              padding: '14px 34px', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase', fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
            }}>
              EXPLORE NOW <ArrowRight size={13} />
            </Link>
            <Link href="/about" style={{
              border: '1px solid rgba(201,168,76,0.55)', color: '#C9A84C',
              padding: '14px 34px', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              justifyContent: 'center',
            }}>
              OUR STORY
            </Link>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5) 30%, rgba(201,168,76,0.5) 70%, transparent)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SLIDE 3 — Full-bleed, text bottom-left, wide billboard style
───────────────────────────────────────────────────────────── */
function Slide3({ out }: { out: boolean }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100vh', minHeight: '600px',
      display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
    }}>
      {/* full image */}
      <img
        src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1800&q=90"
        alt=""
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 30%',
          filter: 'brightness(0.5) saturate(0.85)',
          opacity: out ? 0 : 1, transform: out ? 'scale(1.04)' : 'scale(1)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      />
      {/* strong bottom gradient so text is always legible */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)',
      }} />
      {/* right-side subtle darken */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%)',
      }} />

      {/* content — pinned bottom */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%',
        padding: '0 60px 64px',
        opacity: out ? 0 : 1, transform: out ? 'translateY(18px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '40px', flexWrap: 'wrap',
        }}>
          {/* left — heading */}
          <div style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '1px', background: '#C9A84C' }} />
              <span style={{ color: '#C9A84C', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
                Selkirk Road · London
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.6rem, 6vw, 5.5rem)', fontWeight: 300,
              lineHeight: 1.05, letterSpacing: '0.02em', color: '#fff', marginBottom: '14px',
            }}>
              Discover Unmatched<br />
              <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Elegance</em> &amp; Craftsmanship
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.85, maxWidth: '400px' }}>
              From engagement rings to statement pieces — visit our London workshop or commission entirely online.
            </p>
          </div>

          {/* right — CTAs stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <Link href="/appointments" style={{
              backgroundColor: '#C9A84C', color: '#000',
              padding: '14px 34px', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase', fontWeight: 700,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
            }}>
              BOOK APPOINTMENT <ArrowRight size={13} />
            </Link>
            <Link href="/products" style={{
              border: '1px solid rgba(201,168,76,0.55)', color: '#C9A84C',
              padding: '14px 34px', fontSize: '10px', letterSpacing: '0.25em',
              textTransform: 'uppercase',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              justifyContent: 'center',
            }}>
              VIEW COLLECTIONS
            </Link>
          </div>
        </div>
      </div>

      {/* top gold rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.5) 30%, rgba(201,168,76,0.5) 70%, transparent)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT CAROUSEL CONTROLLER
───────────────────────────────────────────────────────────── */
const SLIDE_COUNT = 3;

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setTransitioning(false);
    }, 550);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % SLIDE_COUNT), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDE_COUNT) % SLIDE_COUNT), [current, goTo]);

  // keep ref in sync so the interval can read latest paused state without re-registering
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // auto-advance every 6 s — skips when paused
  useEffect(() => {
    const t = setInterval(() => { if (!pausedRef.current) next(); }, 6000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <div style={{ position: 'relative', backgroundColor: '#000', overflow: 'hidden' }}>
      {current === 0 && <Slide1 out={transitioning} />}
      {current === 1 && <Slide2 out={transitioning} />}
      {current === 2 && <Slide3 out={transitioning} />}

      {/* ── PREV arrow ── */}
      <button onClick={prev} aria-label="Previous" style={{
        position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
        zIndex: 40, width: '48px', height: '48px',
        backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.4)',
        color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background 0.2s',
      }}>
        <ChevronLeft size={22} />
      </button>

      {/* ── NEXT arrow ── */}
      <button onClick={next} aria-label="Next" style={{
        position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
        zIndex: 40, width: '48px', height: '48px',
        backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.4)',
        color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background 0.2s',
      }}>
        <ChevronRight size={22} />
      </button>

      {/* ── dot indicators + pause/play ── */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: '14px', zIndex: 40,
      }}>
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} style={{
            width: i === current ? '36px' : '8px', height: '3px',
            backgroundColor: i === current ? '#C9A84C' : 'rgba(255,255,255,0.28)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.45s ease',
          }} />
        ))}
        <button
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play' : 'Pause'}
          style={{
            width: '28px', height: '28px',
            backgroundColor: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(201,168,76,0.35)',
            color: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', borderRadius: '50%', flexShrink: 0,
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = '#C9A84C';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(201,168,76,0.12)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.35)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.45)';
          }}
        >
          {paused ? <Play size={11} fill="#C9A84C" /> : <Pause size={11} fill="#C9A84C" />}
        </button>
      </div>

      {/* ── slide counter top-right ── */}
      <div style={{
        position: 'absolute', top: '28px', right: '68px', zIndex: 40,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ color: '#C9A84C', fontSize: '13px', fontFamily: "'Cormorant Garamond',serif" }}>
          0{current + 1}
        </span>
        <div style={{ width: '28px', height: '1px', backgroundColor: 'rgba(255,255,255,0.25)' }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontFamily: "'Cormorant Garamond',serif" }}>
          0{SLIDE_COUNT}
        </span>
      </div>
    </div>
  );
}
