'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

const toSlug = (s: string) => s.toLowerCase().replace(/ /g, '-');

function fallback(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.target as HTMLImageElement).src = '/assets/dshape.webp';
}

// ── Data ───────────────────────────────────────────────────────────────────────
// Metal images are static. All other option images are resolved dynamically
// from /assets/<metal-slug>/<file>.webp so swapping the metal swaps every image.

const METALS = [
  { name: 'Yellow Gold', image: '/assets/yellow-gold-main.jpg'  },
  { name: 'White Gold',  image: '/assets/white-gold-main.png'   },
  { name: 'Rose Gold',   image: '/assets/rose-gold-main.png'    },
  { name: 'Platinum',    image: '/assets/white-gold-main.png'   },
  { name: 'Palladium',   image: '/assets/white-gold-main.png'   },
  { name: 'Silver',      image: '/assets/white-gold-main.png'   },
];

const WIDTHS = [
  { name: '2mm',   file: '2mm'  },
  { name: '2.5mm', file: '2.5mm' },
  { name: '3mm',   file: '3mm'  },
  { name: '4mm',   file: '4mm'  },
  { name: '5mm',   file: '5mm'  },
  { name: '6mm',   file: '6mm'  },
  { name: '7mm',   file: '7mm'  },
  { name: '8mm',   file: '8mm'  },
  { name: '10mm',  file: '10mm' },
  { name: '12mm',  file: '12mm' },
];

const PROFILES = [
  { name: 'D Shape',             sub: 'Standard Fit', file: 'dshape'       },
  { name: 'Court Shape',         sub: 'Comfort Fit',  file: 'courtshape'   },
  { name: 'Cushion Court Shape', sub: 'Comfort Fit',  file: 'cushioncourt' },
  { name: 'Flat Shape',          sub: 'Standard Fit', file: 'flatshape'    },
  { name: 'Flat Comfort Fit',    sub: 'Comfort Fit',  file: 'flatcourt'    },
];

const WEIGHTS = [
  { name: 'Classic Weight',     sizes: 'Sizes D – Z+3',  file: 'classicweight',     ext: 'avif' },
  { name: 'Extra Heavy Weight', sizes: 'Sizes D – Z+6',  file: 'extraheavyweight',  ext: 'avif' },
  { name: 'Super Heavy Weight', sizes: 'Sizes D – Z+12', file: 'superheavyweight',  ext: 'avif' },
];

const CARATS = [
  { name: '9ct',  file: 'carat-9ct'  },
  { name: '14ct', file: 'carat-14ct' },
  { name: '18ct', file: 'carat-18ct' },
  { name: '22ct', file: 'carat-22ct' },
];

// ── Option card ────────────────────────────────────────────────────────────────

function OptionCard({ name, image, sub, sizes, active, onClick, noMetal = false }: {
  name: string; image: string; sub?: string; sizes?: string; active: boolean; onClick: () => void; noMetal?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`relative border text-center transition-all group overflow-hidden
        ${active ? 'border-gold ring-1 ring-gold' : 'border-gray-200 hover:border-gold/50'}`}>
      {active && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center z-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
      )}
      <div className="aspect-[4/3] bg-[#faf8f4] overflow-hidden relative">
        {noMetal ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <span className="text-[10px] text-gray-300 leading-tight text-center px-2">Select<br/>metal first</span>
          </div>
        ) : (
          <img src={image} alt={name} onError={fallback}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
      </div>
      <div className={`px-2 py-2 ${active ? 'bg-cream' : 'bg-white'}`}>
        <p className="text-xs font-medium text-ink leading-tight">{name}</p>
        {sub   && <p className="text-[10px] text-ink-muted mt-0.5">{sub}</p>}
        {sizes && <p className="text-[10px] text-ink-muted mt-0.5">{sizes}</p>}
      </div>
    </button>
  );
}

// ── Step section ───────────────────────────────────────────────────────────────

function StepSection({ number, title, cols, note, children }: {
  number: number; title: string; cols: string; note?: string; children: React.ReactNode;
}) {
  return (
    <div className="pb-10 mb-10 border-b border-gray-200 last:border-0 last:mb-0">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {number}
        </span>
        <h2 className="font-cormorant text-2xl font-light text-ink">{title}</h2>
      </div>
      {note && <p className="text-[11px] text-gold ml-10 mb-4">{note}</p>}
      {!note && <div className="mb-4" />}
      <div className={cols}>{children}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CreateYourOwnRingPage() {
  const [metal,   setMetal]   = useState('');
  const [width,   setWidth]   = useState('');
  const [profile, setProfile] = useState('');
  const [weight,  setWeight]  = useState('');
  const [carat,   setCarat]   = useState('');

  const allSelected = metal && width && profile && weight && carat;

  // Width images — use each metal's own folder
  const img = (file: string) =>
    metal ? `/assets/${toSlug(metal)}/${file}.webp` : `/assets/dshape.webp`;

  // Profile & weight images — silver/platinum/palladium fall back to white-gold folder
  const CONTENT_FOLDER: Record<string, string> = {
    'silver': 'white-gold', 'platinum': 'white-gold', 'palladium': 'white-gold',
  };
  const contentImg = (file: string, ext = 'webp') => {
    if (!metal) return `/assets/dshape.webp`;
    const folder = CONTENT_FOLDER[toSlug(metal)] ?? toSlug(metal);
    return `/assets/${folder}/${file}.${ext}`;
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <section className="bg-[#faf8f4] border-b border-[#e8e0d0] py-14 px-4 text-center">
        <p className="text-gold text-[11px] uppercase tracking-[0.4em] mb-3">Bespoke Service</p>
        <h1 className="font-cormorant text-4xl md:text-5xl font-light text-ink mb-4">
          Create Your Own Wedding Ring
        </h1>
        <p className="text-sm text-ink-muted max-w-lg mx-auto leading-relaxed">
          Design your perfect ring by selecting your preferences below. Every ring is handcrafted to order in London.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

          {/* ── Steps ── */}
          <div>

            {/* Step 1 — Metal */}
            <StepSection number={1} title="Metal" cols="grid grid-cols-6 gap-3">
              {METALS.map(m => (
                <OptionCard
                  key={m.name}
                  name={m.name}
                  image={m.image}
                  active={metal === m.name}
                  onClick={() => setMetal(m.name)}
                />
              ))}
            </StepSection>

            {/* Step 2 — Ring Width */}
            <StepSection number={2} title="Ring Width" cols="grid grid-cols-10 gap-2"
              note={metal ? `Showing in ${metal}` : undefined}>
              {WIDTHS.map(w => (
                <OptionCard
                  key={w.name}
                  name={w.name}
                  image={img(w.file)}
                  noMetal={!metal}
                  active={width === w.name}
                  onClick={() => setWidth(w.name)}
                />
              ))}
            </StepSection>

            {/* Step 3 — Ring Profile */}
            <StepSection number={3} title="Ring Profile" cols="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
              note={metal ? `Showing in ${metal}` : undefined}>
              {PROFILES.map(p => (
                <OptionCard
                  key={p.name}
                  name={p.name}
                  sub={p.sub}
                  image={contentImg(p.file)}
                  noMetal={!metal}
                  active={profile === p.name}
                  onClick={() => setProfile(p.name)}
                />
              ))}
            </StepSection>

            {/* Step 4 — Ring Weight */}
            <StepSection number={4} title="Ring Weight" cols="grid grid-cols-1 sm:grid-cols-3 gap-3"
              note={metal ? `Showing in ${metal}` : undefined}>
              {WEIGHTS.map(w => (
                <OptionCard
                  key={w.name}
                  name={w.name}
                  sizes={w.sizes}
                  image={contentImg(w.file, w.ext)}
                  noMetal={!metal}
                  active={weight === w.name}
                  onClick={() => setWeight(w.name)}
                />
              ))}
            </StepSection>

            {/* Step 5 — Carat / Purity */}
            <StepSection number={5} title="Carat / Purity" cols="grid grid-cols-2 sm:grid-cols-4 gap-3"
              note={metal ? `Showing in ${metal}` : undefined}>
              {CARATS.map(c => (
                <OptionCard
                  key={c.name}
                  name={c.name}
                  image={img(c.file)}
                  noMetal={!metal}
                  active={carat === c.name}
                  onClick={() => setCarat(c.name)}
                />
              ))}
            </StepSection>

            {/* Bottom CTA */}
            <div className="mt-4">
              <Link
                href={allSelected
                  ? `/bespoke?metal=${encodeURIComponent(metal)}&width=${encodeURIComponent(width)}&profile=${encodeURIComponent(profile)}&weight=${encodeURIComponent(weight)}&carat=${encodeURIComponent(carat)}`
                  : '#'}
                className={`btn-gold w-full flex items-center justify-center gap-2 py-4 text-sm uppercase tracking-widest
                  ${!allSelected ? 'opacity-40 pointer-events-none' : ''}`}>
                Request a Quote <ArrowRight size={16} />
              </Link>
              {!allSelected && (
                <p className="text-xs text-ink-muted text-center mt-2">Please make a selection in each step above</p>
              )}
            </div>
          </div>

          {/* ── Sticky summary ── */}
          <div className="sticky top-8 space-y-4">
            <div className="border border-gold/20 p-5 bg-white">
              <h3 className="text-xs uppercase tracking-widest text-ink font-semibold mb-4">Your Selection</h3>
              <div className="space-y-0">
                {[
                  { label: 'Metal',   value: metal   },
                  { label: 'Width',   value: width   },
                  { label: 'Profile', value: profile },
                  { label: 'Weight',  value: weight  },
                  { label: 'Carat',   value: carat   },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-ink-muted">{label}</span>
                    {value
                      ? <span className="text-ink font-medium text-xs text-right">{value}</span>
                      : <span className="text-gray-300 text-xs italic">—</span>}
                  </div>
                ))}
              </div>

              {allSelected && (
                <Link
                  href={`/bespoke?metal=${encodeURIComponent(metal)}&width=${encodeURIComponent(width)}&profile=${encodeURIComponent(profile)}&weight=${encodeURIComponent(weight)}&carat=${encodeURIComponent(carat)}`}
                  className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm uppercase tracking-widest mt-4">
                  Request a Quote <ArrowRight size={15} />
                </Link>
              )}
            </div>

            <div className="border border-gold/10 bg-[#faf8f4] p-4">
              <p className="text-[11px] text-ink-muted leading-relaxed">
                <span className="block font-medium text-ink mb-1">Made to order in London</span>
                Hallmarked by the London Assay Office. Free engraving available. Usually dispatched in 3–5 working days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <section className="bg-[#faf8f4] border-t border-[#e8e0d0] py-12 px-4 mt-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Free Engraving',     body: 'Personalise the inside of your ring with any message up to 40 characters at no extra cost.' },
            { title: 'Free Ring Resizing',  body: 'One complimentary resize within 60 days of purchase if your ring does not fit perfectly.' },
            { title: 'Assay Hallmarked',    body: 'Every ring is independently hallmarked by the London Assay Office, guaranteeing metal quality.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <p className="text-sm font-medium text-ink mb-2">{title}</p>
              <p className="text-xs text-ink-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
