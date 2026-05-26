import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Personalised Engraving | BRM Jewellery',
  description: 'Free personalised engraving on wedding rings from BRM Jewellery. Available in script, arial and roman fonts.',
};

const FONTS = [
  {
    name: 'Script',
    description: 'An elegant, flowing cursive style — similar to Edwardian Script. Scrolled like fine handwriting. The most popular choice for wedding ring inscriptions.',
    example: 'Forever & Always',
  },
  {
    name: 'Arial',
    description: 'A clean, modern sans-serif. Particularly well-suited to very narrow ring profiles where space is limited, as it retains legibility at small sizes.',
    example: 'Forever & Always',
  },
  {
    name: 'Roman',
    description: 'A classic serif font similar to Times New Roman. Traditional and timeless — ideal for dates, initials, and formal inscriptions.',
    example: 'Forever & Always',
  },
];

export default function PersonalisedEngravingPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Make It Yours
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Personalised Engraving
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          We offer complimentary engraving on all wedding rings — add a name, date, or personal message to make your ring truly unforgettable.
        </p>
      </section>

      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          <div style={{ backgroundColor: '#C9A84C', color: '#000', padding: '20px 28px', marginBottom: '40px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Free Engraving on Wedding Rings
            </p>
            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.7 }}>
              Standard inside engraving is complimentary on all wedding rings (normally valued at £20). Up to 40 characters in standard Latin letters, numbers, and basic symbols.
            </p>
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px' }}>
            Font Options
          </h2>

          <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
            {FONTS.map((font) => (
              <div key={font.name} style={{ border: '1px solid #e8e0d0', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>{font.name}</p>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.75, margin: 0 }}>{font.description}</p>
                  </div>
                  <div style={{ backgroundColor: '#faf8f4', padding: '10px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: font.name === 'Script' ? '18px' : '15px',
                      fontStyle: font.name === 'Script' ? 'italic' : 'normal',
                      fontFamily: font.name === 'Arial' ? 'Arial, sans-serif' : font.name === 'Script' ? 'cursive' : 'Georgia, serif',
                      color: '#C9A84C',
                    }}>
                      {font.example}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Pricing &amp; Timings
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '32px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f0e8' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Engraving Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Cost</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Extra Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Standard inside engraving (Latin script, up to 40 chars)', cost: 'Free', time: '+2 working days' },
                { type: 'Special language (Arabic, Russian, Chinese, Hebrew, Runes)', cost: 'From £20', time: '+2 working days' },
                { type: 'Outside / external engraving', cost: 'From £30', time: '+2–3 working days' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4' }}>
                  <td style={{ padding: '11px 16px', color: '#444' }}>{row.type}</td>
                  <td style={{ padding: '11px 16px', color: '#C9A84C', fontWeight: 600 }}>{row.cost}</td>
                  <td style={{ padding: '11px 16px', color: '#444' }}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#faf8f4', border: '1px solid #e8e0d0', padding: '24px', marginBottom: '40px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>Important</p>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.85, margin: 0 }}>
              Items with engravings or personalisation are excluded from our standard returns policy. However, free resizing within two sizes is still available within 30 days of delivery. Please double-check your inscription carefully before confirming your order.
            </p>
          </div>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, marginBottom: '32px' }}>
            To add an engraving, enter your inscription in the order notes at checkout, or <Link href="/contact" style={{ color: '#C9A84C' }}>contact us</Link> and we will be happy to assist.
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
