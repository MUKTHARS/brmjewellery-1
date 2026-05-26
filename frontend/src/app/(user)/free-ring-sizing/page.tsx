import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Ring Sizing | BRM Jewellery',
  description: 'BRM Jewellery offers free ring resizing and exchange if your ring doesn\'t fit on arrival.',
};

export default function FreeRingSizingPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Guaranteed Perfect Fit
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Free Ring Sizing
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          We want your ring to fit perfectly. If it doesn&apos;t, we will resize or exchange it free of charge.
        </p>
      </section>

      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.85, marginBottom: '24px' }}>
            If when you receive a ring it does not fit, as long as you have been able to check the finger size with the ring gauge we send after placing an order, it can be sent back to us for free resizing or exchange — subject to our Terms &amp; Conditions. We only ask that you cover the return postage.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            How It Works
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            After your order is placed, we send you a complimentary ring sizer so you can verify the correct size before we manufacture your ring. If the ring still doesn&apos;t fit on arrival, contact us within 30 days and we will arrange a free resize or exchange.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '32px' }}>
            Resizing is available for customised or engraved rings within a two-size difference. Plain wedding ring adjustments made after the initial free period start from £20. Please call or email us for a quote on more complex alterations.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Ways to Measure Your Ring Size
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
            {[
              'Downloadable printable finger sizer guide (requires a PDF viewer — print at 100%, no scaling)',
              'Complimentary physical ring gauge set sent by post — contact us to request one free of charge',
              'Automatic ring sizer dispatched with your order confirmation for eligible styles',
              'In-store finger measuring at our Selkirk Road or Hatton Garden locations — no appointment needed',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#C9A84C', borderRadius: '50%', marginTop: '7px', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, margin: 0 }}>{item}</p>
              </li>
            ))}
          </ul>

          <div style={{ backgroundColor: '#faf8f4', border: '1px solid #e8e0d0', padding: '24px', marginBottom: '40px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>Please note</p>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.85, margin: 0 }}>
              Items with engravings or personalisation are excluded from our standard returns policy but are still covered by our free resizing service within two sizes for the first 30 days after delivery.
            </p>
          </div>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, marginBottom: '32px' }}>
            If you have any questions about sizing, please <Link href="/contact" style={{ color: '#C9A84C' }}>get in touch</Link> or visit us in store — we are always happy to help you find the perfect fit.
          </p>

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
