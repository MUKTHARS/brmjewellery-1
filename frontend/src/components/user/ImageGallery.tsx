'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface Props { images: { url: string; altText?: string }[] }

export default function ImageGallery({ images }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) return (
    <div className="aspect-square bg-cream flex items-center justify-center">
      <span className="font-cormorant text-6xl text-gold/20">BRM</span>
    </div>
  );

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="aspect-square bg-cream overflow-hidden relative group">
        <img src={images[active].url} alt={images[active].altText || 'Product'}
          className="w-full h-full object-cover" />
        <button onClick={() => setLightbox(true)}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={16} className="text-ink" />
        </button>
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={18} className="text-ink" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={18} className="text-ink" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`w-16 h-16 flex-shrink-0 overflow-hidden border-2 transition-colors ${active === i ? 'border-gold' : 'border-transparent'}`}>
              <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white">
                <ChevronLeft size={32} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white">
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <img src={images[active].url} alt="" className="max-w-3xl max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
