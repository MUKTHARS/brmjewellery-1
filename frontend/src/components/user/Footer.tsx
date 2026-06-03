import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20" style={{ borderTop: '4px solid #059669', backgroundColor: '#faf8f4', color: '#444' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <p className="font-cormorant text-2xl font-light tracking-[0.3em]" style={{ color: '#1a1a1a' }}>BRM</p>
              <p className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: '#aaa' }}>Jewellery</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#777' }}>
              Handcrafted luxury jewellery from London. Each piece tells a story of timeless craftsmanship.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: '#000000' }}>Collections</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#555' }}>
              {['Rings', 'Chains & Necklaces', 'Bracelets', 'Earrings', 'Pendants'].map((c) => (
                <li key={c}><Link href={`/products?category=${c.toLowerCase()}`} className="hover:text-gold transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>

          {/* Browse By Category */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: '#000000' }}>Browse By Category</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#555' }}>
              <li><Link href="/products?category=wedding-rings" className="hover:text-gold transition-colors">Wedding Rings</Link></li>
              <li><Link href="/products?category=plain-wedding-rings" className="hover:text-gold transition-colors">Plain Wedding Rings</Link></li>
              <li><Link href="/products?category=patterned-wedding-rings" className="hover:text-gold transition-colors">Patterned Wedding Rings</Link></li>
              <li><Link href="/products?category=stone-set-wedding-rings" className="hover:text-gold transition-colors">Stone Set Wedding Rings</Link></li>
              <li><Link href="/products?category=two-three-colour-wedding-rings" className="hover:text-gold transition-colors">Two &amp; Three Colour Metal Wedding Rings</Link></li>
              <li><Link href="/products?category=engagement-rings" className="hover:text-gold transition-colors">Engagement Rings</Link></li>
              <li><Link href="/products?category=eternity-rings" className="hover:text-gold transition-colors">Eternity Rings</Link></li>
              <li><Link href="/products" className="hover:text-gold transition-colors">Jewellery</Link></li>
            </ul>
          </div>

          {/* More Information */}
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-4" style={{ color: '#000000' }}>More Information</h4>
            <ul className="space-y-2 text-sm" style={{ color: '#555' }}>
              <li><Link href="/delivery" className="hover:text-gold transition-colors">Delivery Information</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/visit-us" className="hover:text-gold transition-colors">Visit Us</Link></li>
              <li><Link href="/create-your-own-ring" className="hover:text-gold transition-colors">Create Your Own Ring</Link></li>
              <li><Link href="/ring-builder" className="hover:text-gold transition-colors">Find Your Ring Size</Link></li>
              <li><Link href="/free-ring-sizing" className="hover:text-gold transition-colors">Free Ring Sizing</Link></li>
              <li><Link href="/matt-and-hammered-finishes" className="hover:text-gold transition-colors">Matt and Hammered Finishes</Link></li>
              <li><Link href="/personalised-engraving" className="hover:text-gold transition-colors">Personalised Engraving</Link></li>
              <li><Link href="/hallmarking" className="hover:text-gold transition-colors">Hallmarking</Link></li>
              <li><Link href="/product-information" className="hover:text-gold transition-colors">Product Information</Link></li>
              <li><Link href="/refund-policy" className="hover:text-gold transition-colors">Refunds and Exchanges</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-gold transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

        </div>

        {/* Hallmark & Payment Section */}
        <div className="py-10 flex flex-col md:flex-row justify-between items-center gap-10" style={{ borderTop: '1px solid #e8e0d0' }}>
          <div className="flex-shrink-0">
            <a
              href="https://www.assayofficelondon.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:scale-105 transition-transform duration-300"
            >
              <img
                src="/assets/image.png"
                alt="Hallmark of The Goldsmiths' Company"
                className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>

          <div className="px-6 py-4 flex flex-wrap justify-center items-center gap-6" style={{ backgroundColor: '#faf8f4' }}>
            <svg viewBox="0 0 780 500" className="h-5 w-auto" aria-label="Visa">
              <rect width="780" height="500" rx="40" fill="#1A1F71"/>
              <path d="M293 348.5L326.5 153H377L343.5 348.5H293Z" fill="white"/>
              <path d="M524 157.3C513.8 153.5 497.8 149.5 477.8 149.5C428.3 149.5 393.3 175.3 393 212.5C392.8 239.8 418.5 254.8 438 263.8C458 273 464.5 279 464.5 287.5C464.3 300.5 448.5 306.3 433.8 306.3C413.5 306.3 402.5 303.3 385.8 296L379 293L371.8 339.3C383.8 344.8 406.3 349.5 429.8 349.8C482.5 349.8 516.8 324.3 517.3 284.5C517.5 262.5 504 245.8 474.5 231.8C456.5 222.8 445.5 216.8 445.5 207.8C445.8 199.5 455.3 191 476.3 191C493.8 190.8 506.5 194.5 516.5 198.3L521.3 200.5L528.3 157L524 157.3Z" fill="white"/>
              <path d="M640.5 153H601C588.5 153 579.3 156.5 574.3 169.3L499.5 348.5H552.3L562.8 319.3L626.5 319.5C628 331.5 637 348.5 637 348.5H684L640.5 153ZM578 281.3C582 270.3 601.3 219.3 601.3 219.3C601 219.8 605.3 208 607.8 200.8L611.3 217.5C611.3 217.5 622.3 269.5 624.5 281.3H578Z" fill="white"/>
              <path d="M244.5 153L195.3 279.5L189.8 252.5C180.3 222 151.8 188.8 120 172.3L164.8 348.3H218L297.5 153H244.5Z" fill="white"/>
              <path d="M147.5 153H65.5L65 156.8C127.5 172.3 169.3 207.5 186.3 252.5L169 169.5C166 156.8 157 153.5 147.5 153Z" fill="#F2AE14"/>
            </svg>
            <svg viewBox="0 0 131.39 86.9" className="h-5 w-auto" aria-label="Mastercard">
              <circle cx="43.45" cy="43.45" r="43.45" fill="#EB001B"/>
              <circle cx="87.94" cy="43.45" r="43.45" fill="#F79E1B"/>
              <path d="M65.7 13.15a43.45 43.45 0 0 1 0 60.6 43.45 43.45 0 0 1 0-60.6Z" fill="#FF5F00"/>
            </svg>
            <svg viewBox="0 0 165 105" className="h-5 w-auto" aria-label="Apple Pay">
              <rect width="165" height="105" rx="10" fill="#000"/>
              <path d="M60 35c-1.4 1.7-3.7 3-5.9 2.8-.3-2.3.8-4.7 2.1-6.2 1.4-1.7 3.8-3 5.8-3.1.2 2.4-.7 4.8-2 6.5zm1.9 3c-3.3-.2-6.1 1.9-7.7 1.9-1.6 0-4-1.8-6.6-1.7-3.4.1-6.5 2-8.2 5.1-3.5 6.1-.9 15.1 2.5 20 1.6 2.4 3.6 5.1 6.1 5 2.4-.1 3.4-1.6 6.3-1.6s3.8 1.6 6.4 1.5c2.6-.1 4.3-2.4 5.9-4.8 1.9-2.7 2.6-5.3 2.7-5.5-.1 0-5.2-2-5.2-7.8 0-4.9 4-7.2 4.2-7.4-2.3-3.4-5.9-3.7-7.4-3.7z" fill="white"/>
              <text x="90" y="62" fontFamily="system-ui" fontSize="28" fontWeight="600" fill="white">Pay</text>
            </svg>
            <img 
              src="https://logowik.com/content/uploads/images/google-pay-new-20219489.jpg" 
              alt="Google Pay" 
              className="h-8 w-auto object-contain"
            />
            <img 
              src="https://tse1.explicit.bing.net/th/id/OIP.UEXTt6nVBMLf5I8rQh8U_wHaFj?rs=1&pid=ImgDetMain&o=7&rm=3" 
              alt="PayPal" 
              className="h-8 w-auto object-contain"
            />
            <svg viewBox="0 0 512 170" className="h-5 w-auto" aria-label="Klarna">
              <rect width="512" height="170" fill="#FFB3C7"/>
              <text x="30" y="120" fontFamily="system-ui" fontSize="90" fontWeight="800" fill="#000">klarna</text>
            </svg>
            <svg viewBox="0 0 512 170" className="h-5 w-auto" aria-label="Clearpay">
              <rect width="512" height="170" fill="#B2FCE4"/>
              <text x="20" y="120" fontFamily="system-ui" fontSize="80" fontWeight="800" fill="#000">Clearpay</text>
            </svg>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderTop: '1px solid #e8e0d0' }}>
          <p className="text-xs" style={{ color: '#aaa' }}>© {new Date().getFullYear()} BRM Jewellery Ltd. All rights reserved.</p>
          <div className="flex gap-4 text-xs" style={{ color: '#aaa' }}>
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link href="/visit-us" className="hover:text-gold transition-colors">Visit Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
