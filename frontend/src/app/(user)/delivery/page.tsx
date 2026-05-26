import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delivery Information | BRM Jewellery',
  description: 'Delivery times, shipping costs and postage information for BRM Jewellery orders.',
};

const POSTAGE_ROWS = [
  { destination: 'UK — Order value £1 – £149.99', cost: 'From £5.00' },
  { destination: 'UK — Order value £150 – £1,999.99', cost: '£8.00' },
  { destination: 'UK — Order value £2,000+', cost: 'Free' },
  { destination: 'Europe', cost: '£15.00' },
  { destination: 'Worldwide', cost: '£20.00' },
];

export default function DeliveryPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Shipping &amp; Postage
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Delivery Information
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '540px', margin: '0 auto', lineHeight: 1.8 }}>
          We dispatch orders across the UK and worldwide using fully tracked and insured services.
        </p>
      </section>

      {/* Content */}
      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Dispatch Times
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '12px' }}>
            Most plain wedding rings are dispatched within one week of your order being placed. Other styles, including diamond-set and multi-tone rings, are typically dispatched within 2–3 weeks. In exceptional circumstances, dispatch may take up to 20 working days.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '32px' }}>
            Engraving or special finishes (matt, hammered) add approximately 2 working days to the dispatch time.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Shipping Methods
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong>UK orders</strong> are sent via Royal Mail Tracked or Royal Mail Special Delivery (next working day by 1pm, fully insured).
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong>International orders</strong> are sent via Royal Mail International Tracked or a tracked courier service depending on value and destination.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '32px' }}>
            EU deliveries typically arrive within 5 working days of dispatch. Worldwide deliveries may take 7–14 working days depending on the destination country and local customs processing.
          </p>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Postage Costs
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '32px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f0e8' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0', color: '#1a1a1a' }}>Destination</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e8e0d0', color: '#1a1a1a' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {POSTAGE_ROWS.map((row, i) => (
                <tr key={row.destination} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : '#faf8f4' }}>
                  <td style={{ padding: '11px 16px', color: '#444' }}>{row.destination}</td>
                  <td style={{ padding: '11px 16px', color: '#1a1a1a', fontWeight: 600 }}>{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Click &amp; Collect
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '32px' }}>
            You are welcome to collect your order in person from our Selkirk Road store in London at no postage cost. Please contact us after placing your order to arrange collection.
          </p>

          {/* Contact strip */}
          <div style={{ borderTop: '1px solid #e8e0d0', paddingTop: '32px', marginTop: '8px' }}>
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
