import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Information | BRM Jewellery',
  description: 'Detailed product information for BRM Jewellery — metal purities, ring profiles, care guidance, and size specifications.',
};

const METAL_PURITIES = [
  { metal: 'Gold — 9ct', purity: '37.5%', hallmark: '375' },
  { metal: 'Gold — 14ct', purity: '58.5%', hallmark: '585' },
  { metal: 'Gold — 18ct', purity: '75.0%', hallmark: '750' },
  { metal: 'Gold — 22ct', purity: '91.6%', hallmark: '916' },
  { metal: 'Platinum', purity: '95.0%', hallmark: '950' },
  { metal: 'Palladium 950', purity: '95.0%', hallmark: '950' },
  { metal: 'Palladium 500', purity: '50.0%', hallmark: '500' },
  { metal: 'Sterling Silver', purity: '92.5%', hallmark: '925' },
  { metal: 'Argentium Silver', purity: '95.8%', hallmark: '958' },
];

const RING_GAUGES = [
  { profile: 'D Shape', classic: '1.1 mm', extraHeavy: '1.5 mm', superHeavy: '1.9 mm' },
  { profile: 'Court', classic: '1.3 mm', extraHeavy: '1.8 mm', superHeavy: '2.3 mm' },
  { profile: 'Flat', classic: '1.0 mm', extraHeavy: '1.3 mm', superHeavy: '1.6 mm' },
];

const NECKLACE_LENGTHS = [
  { length: '16 inches (41 cm)', use: 'Ladies choker / child\'s pendant' },
  { length: '18 inches (46 cm)', use: 'Ladies pendant / gentleman\'s choker' },
  { length: '20 inches (51 cm)', use: 'Average gentleman\'s / ladies cleavage length' },
  { length: '22 inches (56 cm)', use: 'Gentleman\'s waist chain' },
  { length: '28 inches (71 cm)', use: 'Longer waist chain / statement length' },
];

export default function ProductInformationPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Specifications &amp; Care
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Product Information
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          Detailed specifications, care guidance, and technical information for all BRM Jewellery products.
        </p>
      </section>

      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          {/* General disclaimers */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            General Product Notes
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
            {[
              'Product photographs are not shown at actual scale.',
              'Screen colours may not perfectly represent the true colour of the finished item due to monitor variation.',
              'As handcrafted items, individual pieces may show slight natural variation in weight and appearance.',
              'Natural stones possess expected variation in colour and character — this is not a defect.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#C9A84C', borderRadius: '50%', marginTop: '7px', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, margin: 0 }}>{item}</p>
              </li>
            ))}
          </ul>

          {/* Care */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Jewellery Care
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '12px' }}>
            With proper care your BRM Jewellery piece will last a lifetime. We recommend the following:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
            {[
              'Remove rings and bracelets during heavy manual work such as gardening or building to prevent scratching and distortion.',
              'Avoid exposing your jewellery to chlorinated swimming pools, seawater, and spa baths, as chemicals can damage precious metals and gemstone settings.',
              'Clean with warm water, a small amount of mild soap, and a soft toothbrush. Rinse thoroughly and pat dry with a soft cloth.',
              'Store pieces individually in a soft pouch or jewellery box to prevent scratching.',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#C9A84C', borderRadius: '50%', marginTop: '7px', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, margin: 0 }}>{item}</p>
              </li>
            ))}
          </ul>

          {/* Metal purities */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Metal Fineness Standards
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '32px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f0e8' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Metal</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Purity</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Hallmark</th>
              </tr>
            </thead>
            <tbody>
              {METAL_PURITIES.map((row, i) => (
                <tr key={row.metal} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4' }}>
                  <td style={{ padding: '11px 16px', color: '#444' }}>{row.metal}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a' }}>{row.purity}</td>
                  <td style={{ padding: '11px 16px', color: '#C9A84C', fontWeight: 600 }}>{row.hallmark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ backgroundColor: '#faf8f4', border: '1px solid #e8e0d0', padding: '20px 24px', marginBottom: '40px', fontSize: '13px', color: '#555', lineHeight: 1.8 }}>
            <strong>White Gold:</strong> All white gold is naturally off-white in colour. Most 9ct, 14ct and 18ct white gold items are Rhodium plated to give a brighter, more reflective surface — however this plating will wear over time and can be re-applied by a jeweller.
          </div>

          {/* Ring gauge */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Wedding Ring Wall Thickness (Gauge)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f0e8' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Profile</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Classic</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Extra Heavy</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Super Heavy</th>
              </tr>
            </thead>
            <tbody>
              {RING_GAUGES.map((row, i) => (
                <tr key={row.profile} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4' }}>
                  <td style={{ padding: '11px 16px', color: '#444', fontWeight: 500 }}>{row.profile}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a' }}>{row.classic}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a' }}>{row.extraHeavy}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a' }}>{row.superHeavy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '40px', lineHeight: 1.7 }}>
            Band widths carry a ±0.5 mm tolerance. Item weights carry a tolerance of ±0.2 g (under 2 g) or ±10% (over 2 g).
          </p>

          {/* Necklace lengths */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Standard Necklace Lengths
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '40px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f0e8' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Length</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Typical Use</th>
              </tr>
            </thead>
            <tbody>
              {NECKLACE_LENGTHS.map((row, i) => (
                <tr key={row.length} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4' }}>
                  <td style={{ padding: '11px 16px', color: '#444', whiteSpace: 'nowrap' }}>{row.length}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a' }}>{row.use}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bracelet sizes */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Standard Bracelet Sizes
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '40px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f0e8' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Size</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0' }}>Typical Fit</th>
              </tr>
            </thead>
            <tbody>
              {[
                { size: '7½ inches (190 mm)', fit: 'Average lady' },
                { size: '8¼ inches (209 mm)', fit: 'Average gentleman' },
              ].map((row, i) => (
                <tr key={row.size} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4' }}>
                  <td style={{ padding: '11px 16px', color: '#444' }}>{row.size}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a' }}>{row.fit}</td>
                </tr>
              ))}
            </tbody>
          </table>

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
