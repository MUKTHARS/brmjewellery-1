import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-20" style={{ borderTop: '4px solid #059669' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <p className="font-cormorant text-2xl font-light tracking-[0.3em] text-white">BRM</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/40 mt-0.5">Jewellery</p>
            </div>
            <p className="text-xs leading-relaxed text-white/50">
              Handcrafted luxury jewellery from London. Each piece tells a story of timeless craftsmanship.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4">Collections</h4>
            <ul className="space-y-2 text-sm">
              {['Rings', 'Chains & Necklaces', 'Bracelets', 'Earrings', 'Pendants'].map((c) => (
                <li key={c}><Link href={`/products?category=${c.toLowerCase()}`} className="hover:text-gold transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/bespoke" className="hover:text-gold transition-colors">Bespoke Jewellery</Link></li>
              <li><Link href="/appointments" className="hover:text-gold transition-colors">Book Appointment</Link></li>
              <li><Link href="/account/orders" className="hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link href="/faq" className="hover:text-gold transition-colors">FAQ</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-4">Contact</h4>
            <ul className="space-y-2 text-xs text-white/50">
              <li>Branch 1: 3 Selkirk Road, London, England, SW17 0ER</li>
              <li>Branch 2: 1st Floor Suite 8A, 34-35 Hatton Garden, London EC1N 8DX</li>
              <li><a href="mailto:hello@brmjewellery.co.uk" className="hover:text-gold transition-colors">hello@brmjewellery.co.uk</a></li>
              <li><a href="tel:+442071234567" className="hover:text-gold transition-colors">+44 (0)20 7123 4567</a></li>
              <li>Mon–Sat, 10am–6pm GMT</li>
              <li className="pt-1"><Link href="/contact" className="hover:text-gold transition-colors">Send a message →</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} BRM Jewellery Ltd. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white/60 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
