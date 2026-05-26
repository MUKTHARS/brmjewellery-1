import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'The story behind BRM Jewellery — handcrafted luxury from London.',
};

const VALUES = [
  { title: 'Ethical Sourcing', body: 'Every gram of gold, silver, and platinum we use is responsibly and ethically sourced, fully traceable from mine to market.' },
  { title: 'Master Craftsmanship', body: 'Our goldsmiths have trained for decades in classical jewellery-making traditions, combining heritage technique with modern precision.' },
  { title: 'Hallmarked & Certified', body: 'Every piece is assayed and hallmarked by the London Assay Office — your guarantee of metal purity and authenticity.' },
  { title: 'Made to Order', body: 'We craft each piece individually when you place your order. No mass production, no warehouse stock — only purpose-made jewellery.' },
];

const TIMELINE = [
  { year: '2010', event: 'BRM Jewellery founded in East London by master goldsmith Bashir Rahman.' },
  { year: '2013', event: 'First bespoke commission — a platinum engagement ring that became our signature.' },
  { year: '2016', event: 'Opened our Hatton Garden workshop, the heart of London\'s jewellery quarter.' },
  { year: '2019', event: 'Launched online, bringing handcrafted luxury to customers across the United Kingdom.' },
  { year: '2022', event: 'Expanded bespoke service with dedicated design consultants and CAD rendering.' },
  { year: '2024', event: 'Serving thousands of customers across the UK with the same passion as day one.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ink py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold text-xs uppercase tracking-[0.4em] mb-4">Our Story</p>
          <h1 className="font-cormorant text-5xl md:text-6xl font-light text-white leading-tight mb-6">
            Where Precious Metals<br />Meet Artistry
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-xl mx-auto">
            Born in the heart of London, BRM Jewellery was founded on a single belief: that every person deserves jewellery crafted with intention, skill, and soul.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Who We Are</p>
            <h2 className="font-cormorant text-4xl font-light text-ink mb-6 leading-snug">
              London Jewellers, Proudly Independent
            </h2>
            <div className="space-y-4 text-ink-muted text-sm leading-relaxed">
              <p>
                BRM Jewellery is an independent luxury jeweller based in London. We specialise in handcrafted fine jewellery using gold, silver, and platinum, finished to the highest standard.
              </p>
              <p>
                Unlike large retail chains, every piece we create is made individually by our master goldsmiths. We work directly with our customers to understand what they want — whether it is a ready-made collection piece or a fully bespoke commission designed from scratch.
              </p>
              <p>
                Our workshops are staffed by jewellers who have spent years perfecting their craft. We combine traditional goldsmithing techniques with modern technology — including CAD design and 3D rendering — to deliver jewellery of exceptional quality and precision.
              </p>
            </div>
            <div className="flex gap-4 mt-8">
              <Link href="/bespoke" className="btn-gold inline-flex items-center gap-2 px-6 py-3 text-sm">
                Create Bespoke <ArrowRight size={14} />
              </Link>
              <Link href="/appointments" className="btn-outline-gold inline-flex items-center gap-2 px-6 py-3 text-sm">
                Book Visit
              </Link>
            </div>
          </div>
          <div className="bg-cream aspect-square flex items-center justify-center">
            <div className="text-center">
              <span className="font-cormorant text-8xl text-gold/20">BRM</span>
              <p className="text-xs text-ink-muted mt-2 uppercase tracking-widest">Est. London 2010</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold text-xs uppercase tracking-widest mb-2">What We Stand For</p>
            <h2 className="font-cormorant text-4xl font-light text-ink">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white border border-gold/10 p-6">
                <div className="w-8 h-px bg-gold mb-4" />
                <h3 className="font-semibold text-sm text-ink uppercase tracking-wider mb-3">{v.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand History Timeline */}
      {/* <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-gold text-xs uppercase tracking-widest mb-2">Our Journey</p>
          <h2 className="font-cormorant text-4xl font-light text-ink">Company History</h2>
        </div>
        <div className="relative">
          <div className="absolute left-16 top-0 bottom-0 w-px bg-gold/20" />
          <div className="space-y-8">
            {TIMELINE.map((t) => (
              <div key={t.year} className="flex gap-8 items-start">
                <div className="w-16 flex-shrink-0 text-right">
                  <span className="font-cormorant text-xl text-gold">{t.year}</span>
                </div>
                <div className="relative pl-8 flex-1">
                  <div className="absolute left-0 top-2 w-3 h-3 bg-gold/30 border border-gold rounded-full -translate-x-1.5" />
                  <p className="text-sm text-ink-muted leading-relaxed">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Location / Address */}
      <section className="bg-ink py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold text-xs uppercase tracking-widest mb-3">Find Us</p>
              <h2 className="font-cormorant text-4xl font-light text-white mb-8">Visit Our Workshop</h2>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <MapPin size={18} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Branch 1</p>
                    <p className="text-white/50 text-sm mt-0.5">3 Selkirk Road<br />London, England, SW17 0ER<br />United Kingdom</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin size={18} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">Branch 2</p>
                    <p className="text-white/50 text-sm mt-0.5">1st Floor Suite 8A<br />34-35 Hatton Garden<br />London EC1N 8DX<br />United Kingdom</p>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <Phone size={18} className="text-gold flex-shrink-0" />
                  <a href="tel:+442071234567" className="text-white/70 text-sm hover:text-gold transition-colors">+44 (0) 20 7123 4567</a>
                </li>
                <li className="flex items-center gap-4">
                  <Mail size={18} className="text-gold flex-shrink-0" />
                  <a href="mailto:support@brmjewellery.co.uk" className="text-white/70 text-sm hover:text-gold transition-colors">support@brmjewellery.co.uk</a>
                </li>
                <li className="flex items-center gap-4">
                  <Clock size={18} className="text-gold flex-shrink-0" />
                  <div className="text-white/70 text-sm">
                    <p>Monday – Saturday: 10am – 6pm</p>
                    {/* <p>Saturday: 10am – 5pm</p> */}
                    <p>Sunday: Closed</p>
                  </div>
                </li>
              </ul>
              <Link href="/appointments" className="inline-flex items-center gap-2 mt-8 btn-gold px-6 py-3 text-sm">
                Book an Appointment <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-white/5 border border-white/10 aspect-video flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-gold mx-auto mb-3" />
                <p className="text-white/50 text-sm">Selkirk Road, London</p>
                <p className="text-white/30 text-xs mt-1">SW17 0ER</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-gold/10">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="font-cormorant text-3xl font-light text-ink mb-4">Ready to Find Your Perfect Piece?</h2>
          <p className="text-ink-muted text-sm mb-8">Browse our collections or start a bespoke commission today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm">
              Shop Collections <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="btn-outline-gold inline-flex items-center gap-2 px-8 py-3 text-sm">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
