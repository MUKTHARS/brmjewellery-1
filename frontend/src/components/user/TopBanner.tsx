'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  'T: +44 (0) 20 7123 4567   |   E: hello@brmjewellery.co.uk',
  'Finance Available',
  'Free Engraving & Matt Finish On All Wedding Rings',
];

export default function TopBanner() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent((index + SLIDES.length) % SLIDES.length);
      setVisible(true);
    }, 300);
  }, []);

  const next = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo(current + 1);
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % SLIDES.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const arrowStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(201,168,76,0.55)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    height: '100%',
    flexShrink: 0,
    transition: 'color 0.2s',
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid rgba(201,168,76,0.18)',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          style={arrowStyle}
          onClick={prev}
          onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.55)')}
          aria-label="Previous"
        >
          <ChevronLeft size={14} />
        </button>

        <p style={{
          fontSize: '11px',
          letterSpacing: '0.04em',
          color: 'rgba(255,255,255,0.78)',
          margin: 0,
          width: '460px',
          textAlign: 'center',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-6px)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {SLIDES[current]}
        </p>

        <button
          style={arrowStyle}
          onClick={next}
          onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(201,168,76,0.55)')}
          aria-label="Next"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
