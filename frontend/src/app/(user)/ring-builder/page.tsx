'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import { metalPriceApi } from '@/api/metalPrice.api';
import { formatGBP } from '@/lib/formatCurrency';

// ── Types ──────────────────────────────────────────────────────────────────
interface MetalPrice {
  metal: string;
  carat?: string;
  pricePerGramGBP: number;
}

const METALS = [
  { id: 'Gold-9ct', metal: 'Gold', carat: '9ct', label: '9ct Gold', colour: '#D4AF37' },
  { id: 'Gold-18ct', metal: 'Gold', carat: '18ct', label: '18ct Gold', colour: '#CFB53B' },
  { id: 'Gold-22ct', metal: 'Gold', carat: '22ct', label: '22ct Gold', colour: '#C5A028' },
  { id: 'Gold-24ct', metal: 'Gold', carat: '24ct', label: '24ct Gold', colour: '#B8960C' },
  { id: 'Silver-925', metal: 'Silver', carat: '925', label: 'Sterling Silver', colour: '#C0C0C0' },
  { id: 'Platinum', metal: 'Platinum', carat: undefined, label: 'Platinum', colour: '#E5E4E2' },
];

const RING_SIZES = [
  { label: 'H', circumferenceMM: 46.8 },
  { label: 'I', circumferenceMM: 47.4 },
  { label: 'J', circumferenceMM: 48.0 },
  { label: 'K', circumferenceMM: 49.3 },
  { label: 'L', circumferenceMM: 50.6 },
  { label: 'M', circumferenceMM: 51.9 },
  { label: 'N', circumferenceMM: 53.1 },
  { label: 'O', circumferenceMM: 54.4 },
  { label: 'P', circumferenceMM: 55.7 },
  { label: 'Q', circumferenceMM: 57.0 },
  { label: 'R', circumferenceMM: 58.3 },
  { label: 'S', circumferenceMM: 59.5 },
  { label: 'T', circumferenceMM: 60.8 },
  { label: 'U', circumferenceMM: 62.1 },
  { label: 'V', circumferenceMM: 63.4 },
  { label: 'W', circumferenceMM: 64.6 },
];

const BAND_WIDTHS = [2, 3, 4, 5, 6, 8];
const BAND_THICKNESSES = [1.2, 1.5, 1.8, 2.0, 2.5];
const FINISHES = ['Polished', 'Matte', 'Hammered', 'Brushed', 'Satin'];

// Volume of a ring band in mm³ ≈ π × diameter_mm × width_mm × thickness_mm
// diameter_mm = circumference / π
function ringVolumeGrams(circumferenceMM: number, widthMM: number, thicknessMM: number, densityGPerCM3: number) {
  const diameterMM = circumferenceMM / Math.PI;
  const volumeMM3 = Math.PI * diameterMM * widthMM * thicknessMM;
  const volumeCM3 = volumeMM3 / 1000;
  return volumeCM3 * densityGPerCM3;
}

const DENSITY: Record<string, number> = {
  'Gold-9ct': 11.3,
  'Gold-18ct': 15.5,
  'Gold-22ct': 17.5,
  'Gold-24ct': 19.3,
  'Silver-925': 10.4,
  Platinum: 21.45,
};

export default function RingBuilderPage() {
  const [prices, setPrices] = useState<MetalPrice[]>([]);
  const [selectedMetal, setSelectedMetal] = useState(METALS[1]); // 18ct Gold default
  const [selectedSize, setSelectedSize] = useState(RING_SIZES[4]); // N
  const [bandWidth, setBandWidth] = useState(4);
  const [bandThickness, setBandThickness] = useState(1.5);
  const [finish, setFinish] = useState('Polished');

  useEffect(() => {
    metalPriceApi.getCurrent().then((r) => {
      const data = r.data?.data ?? r.data ?? [];
      setPrices(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  const pricePerGram = (() => {
    const key = selectedMetal.carat
      ? `${selectedMetal.metal}-${selectedMetal.carat}`
      : selectedMetal.metal;
    const entry = prices.find((p) =>
      (p.carat ? `${p.metal}-${p.carat}` : p.metal) === key
    );
    return entry?.pricePerGramGBP ?? null;
  })();

  const estimatedWeightG = ringVolumeGrams(
    selectedSize.circumferenceMM,
    bandWidth,
    bandThickness,
    DENSITY[selectedMetal.id] ?? 15
  );

  const metalCost = pricePerGram !== null ? estimatedWeightG * pricePerGram : null;
  // Add ~40% for labour, hallmarking, finishing
  const totalEstimate = metalCost !== null ? metalCost * 1.4 : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-gold text-xs uppercase tracking-widest mb-3">Design Tool</p>
      <h1 className="font-cormorant text-4xl font-light text-ink mb-2">Ring Builder</h1>
      <p className="text-sm text-ink-muted mb-10 max-w-xl">
        Configure your ring below for a live price estimate based on today's metal spot rates. When you're ready, send us your specification for a formal quote.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Left — configuration */}
        <div className="space-y-8">

          {/* Metal */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink mb-3">Metal</label>
            <div className="grid grid-cols-3 gap-2">
              {METALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMetal(m)}
                  className={`relative border py-3 px-2 text-center transition-all ${
                    selectedMetal.id === m.id
                      ? 'border-gold bg-gold/5'
                      : 'border-gold/20 hover:border-gold/50'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full mx-auto mb-1.5 border border-black/10"
                    style={{ backgroundColor: m.colour }}
                  />
                  <p className="text-[10px] text-ink leading-tight">{m.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Ring Size */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="block text-xs uppercase tracking-widest text-ink">UK Ring Size</label>
              <a
                href="https://www.hsamuel.co.uk/webstore/static/ringsizemeasure"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
                title="Ring size guide"
              >
                <Info size={13} />
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {RING_SIZES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSelectedSize(s)}
                  className={`w-9 h-9 border text-xs transition-all ${
                    selectedSize.label === s.label
                      ? 'border-gold bg-gold text-ink font-medium'
                      : 'border-gold/20 text-ink-muted hover:border-gold hover:text-ink'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Band Width */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink mb-3">
              Band Width — <span className="text-gold">{bandWidth}mm</span>
            </label>
            <div className="flex gap-2">
              {BAND_WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setBandWidth(w)}
                  className={`px-3 py-1.5 border text-xs transition-all ${
                    bandWidth === w
                      ? 'border-gold bg-gold/5 text-ink'
                      : 'border-gold/20 text-ink-muted hover:border-gold'
                  }`}
                >
                  {w}mm
                </button>
              ))}
            </div>
          </div>

          {/* Band Thickness */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink mb-3">
              Band Thickness — <span className="text-gold">{bandThickness}mm</span>
            </label>
            <div className="flex gap-2">
              {BAND_THICKNESSES.map((t) => (
                <button
                  key={t}
                  onClick={() => setBandThickness(t)}
                  className={`px-3 py-1.5 border text-xs transition-all ${
                    bandThickness === t
                      ? 'border-gold bg-gold/5 text-ink'
                      : 'border-gold/20 text-ink-muted hover:border-gold'
                  }`}
                >
                  {t}mm
                </button>
              ))}
            </div>
          </div>

          {/* Finish */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-ink mb-3">Finish</label>
            <div className="flex flex-wrap gap-2">
              {FINISHES.map((f) => (
                <button
                  key={f}
                  onClick={() => setFinish(f)}
                  className={`px-3 py-1.5 border text-xs transition-all ${
                    finish === f
                      ? 'border-gold bg-gold/5 text-ink'
                      : 'border-gold/20 text-ink-muted hover:border-gold'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — summary */}
        <div>
          {/* Ring preview */}
          <div className="bg-cream flex items-center justify-center" style={{ height: 220 }}>
            <div
              className="rounded-full border-solid flex items-center justify-center"
              style={{
                width: 160,
                height: 160,
                borderWidth: `${bandThickness * 10}px`,
                borderColor: selectedMetal.colour,
                boxShadow: `0 0 0 1px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.05)`,
              }}
            />
          </div>

          {/* Specification card */}
          <div className="border border-gold/20 p-6 mt-6 space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-ink font-semibold mb-4">Your Specification</h2>
            {[
              ['Metal', selectedMetal.label],
              ['UK Size', `${selectedSize.label} (⌀ ${(selectedSize.circumferenceMM / Math.PI).toFixed(1)}mm)`],
              ['Band Width', `${bandWidth}mm`],
              ['Thickness', `${bandThickness}mm`],
              ['Finish', finish],
              ['Est. Weight', `${estimatedWeightG.toFixed(2)}g`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-ink-muted">{k}</span>
                <span className="text-ink font-medium">{v}</span>
              </div>
            ))}

            <div className="border-t border-gold/10 pt-4 mt-2">
              {totalEstimate !== null ? (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-ink-muted uppercase tracking-wider">Estimated Price</span>
                    <span className="font-cormorant text-3xl font-light text-ink">{formatGBP(totalEstimate)}</span>
                  </div>
                  <p className="text-[10px] text-ink-muted mt-1">
                    Based on live metal spot price ({formatGBP(pricePerGram!)}/g) + labour &amp; hallmarking. Final price confirmed at consultation.
                  </p>
                </>
              ) : (
                <p className="text-xs text-ink-muted">Loading live metal prices…</p>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 space-y-3">
            <Link
              href={`/bespoke?ring=1&metal=${encodeURIComponent(selectedMetal.label)}&size=${selectedSize.label}&width=${bandWidth}&thickness=${bandThickness}&finish=${encodeURIComponent(finish)}`}
              className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-sm"
            >
              Request a Formal Quote <ArrowRight size={16} />
            </Link>
            <Link
              href="/appointments"
              className="btn-outline-gold w-full flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              Book a Design Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
