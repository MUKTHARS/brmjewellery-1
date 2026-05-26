import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Matt & Hammered Finishes | BRM Jewellery',
  description: 'Explore the range of ring finishes available from BRM Jewellery — polished, matt, hammered, and more.',
};

const FINISHES = [
  { name: 'Polished', description: 'The classic high-shine mirror finish. Applied as standard to all rings unless otherwise requested. Bright, reflective, and timeless.', price: 'Included' },
  { name: 'Brushed Matt', description: 'A soft, satin-like surface created by fine brushing. Subtle and contemporary — particularly popular on flat and court profile wedding rings.', price: 'Complimentary' },
  { name: 'Hammered Matt', description: 'Hand-hammered texture giving each ring a unique, organic pattern. No two pieces are identical. Suits wider band widths.', price: 'From £30' },
  { name: 'Coarse Stardust', description: 'Fine granular texture applied over the surface for a sparkling, frosted look. Catches the light beautifully without being highly polished.', price: 'From £20' },
  { name: 'Sandblast', description: 'An even, fine-grained matte surface achieved by sandblasting. Smooth to the touch but with a non-reflective, industrial aesthetic.', price: 'From £15' },
  { name: 'Distressed / Worn', description: 'A deliberately aged, worn appearance that gives the ring an antique or rustic character. Available on select metals and profiles.', price: 'From £25' },
];

export default function MattAndHammeredFinishesPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Surface &amp; Texture
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Matt &amp; Hammered Finishes
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          The finish of your ring is as personal as its shape and metal. We offer a range of surface treatments — from the classic high-polish to hand-hammered textures — to make your ring truly your own.
        </p>
      </section>

      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            All rings are supplied with a standard polished finish unless you specify otherwise at the time of ordering. The brushed matt finish is available at no additional cost on most styles. Other special finishes are available by request and are priced according to the complexity of the treatment and the ring profile.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            Special finishes add approximately 2 working days to the dispatch time.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px' }}>
            Available Finishes
          </h2>

          <div style={{ display: 'grid', gap: '1px', border: '1px solid #e8e0d0', marginBottom: '40px' }}>
            {FINISHES.map((f, i) => (
              <div key={f.name} style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                padding: '20px 24px', gap: '16px',
                backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4',
                borderBottom: i < FINISHES.length - 1 ? '1px solid #e8e0d0' : 'none',
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}>{f.name}</p>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.75, margin: 0 }}>{f.description}</p>
                </div>
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: '13px', color: '#C9A84C', fontWeight: 600 }}>{f.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#faf8f4', border: '1px solid #e8e0d0', padding: '24px', marginBottom: '40px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>Mixed Finishes</p>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.85, margin: 0 }}>
              Combination finishes — for example polished edges with a brushed matt centre — are also available. Contact us to discuss your requirements and we will provide a bespoke quote.
            </p>
          </div>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, marginBottom: '32px' }}>
            To order a ring with a special finish, simply add a note at checkout or <Link href="/contact" style={{ color: '#C9A84C' }}>contact us</Link> before placing your order and we will confirm pricing and availability for your chosen style.
          </p>

          <div style={{ borderTop: '1px solid #e8e0d0', paddingTop: '32px' }}>
            <p style={{ fontSize: '14px', color: '#444', lineHeight: 2 }}>
              BRM Jewellery · 3 Selkirk Road, London, SW17 0ER &amp; Hatton Garden, EC1N 8DX<br />
              Tel: <a href="tel:+442071234567" style={{ color: '#C9A84C', textDecoration: 'none' }}>+44 (0) 20 7123 4567</a>
              &nbsp;·&nbsp;
              E-mail: <a href="mailto:support@brmjewellery.co.uk" style={{ color: '#C9A84C', textDecoration: 'none' }}>support@brmjewellery.co.uk</a>
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
