import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ring Size Help | BRM Jewellery',
  description: 'How to measure your ring size — guides, tools and free ring sizing from BRM Jewellery.',
};

export default function RingSizeHelpPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Getting the Perfect Fit
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Ring Size Help
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          We want every ring to fit perfectly first time. Here is everything you need to measure correctly and what to do if the size isn't right.
        </p>
      </section>

      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.8, marginBottom: '24px' }}>
            If the size of the ring is not right when you receive your order, you can return it to us to exchange for a different sized ring at no extra charge (return postage applies).
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            How to Measure Your Finger
          </h2>

          {[
            { n: '1', title: 'Download Our Finger Sizer Guide', body: 'We provide a printable finger sizer guide you can use at home. Print it at 100% scale (no scaling), cut out the strip, and follow the instructions to find your ring size. Requires a PDF viewer.' },
            { n: '2', title: 'Request a Free Physical Ring Gauge', body: 'We can send you a complimentary set of plastic ring gauges by post so you can measure your finger precisely before ordering. Simply contact us to request one.' },
            { n: '3', title: 'Automatic Ring Sizer After Purchase', body: 'For certain ring styles, we automatically send a finger measurer and tester ring after your order is placed, so you can confirm your size before we manufacture your ring.' },
            { n: '4', title: 'Visit Us In Store', body: 'Pop into our Selkirk Road or Hatton Garden location and we will measure your finger for free using professional ring gauges. No appointment necessary, though booking ahead is recommended at weekends.' },
          ].map(({ n, title, body }) => (
            <div key={n} style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: '#C9A84C', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                {n}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#1a1a1a' }}>{title}</p>
                <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, margin: 0 }}>{body}</p>
              </div>
            </div>
          ))}

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, margin: '40px 0 16px' }}>
            Free Ring Resizing
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '12px' }}>
            If your ring does not fit on arrival, contact us within 30 days of delivery and we will resize or exchange it free of charge. This includes engraved and specially finished rings within a two-size difference. You only pay return postage.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '32px' }}>
            Future adjustments beyond the initial period start from £20 for plain wedding rings. Please <Link href="/contact" style={{ color: '#C9A84C' }}>contact us</Link> or call for a quote on more complex resizes.
          </p>

          <div style={{ backgroundColor: '#faf8f4', border: '1px solid #e8e0d0', padding: '24px', marginBottom: '32px' }}>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.85, margin: 0 }}>
              <strong>Tip:</strong> Fingers change size throughout the day — they are smallest in the morning and can swell slightly in warm weather. We recommend measuring in the afternoon for the most reliable result.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #e8e0d0', paddingTop: '32px' }}>
            <p style={{ fontSize: '14px', color: '#444', lineHeight: 2 }}>
              BRM Jewellery · 3 Selkirk Road, London, SW17 0ER<br />
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
