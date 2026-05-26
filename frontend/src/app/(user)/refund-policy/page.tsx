import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund Policy | BRM Jewellery',
  description: 'BRM Jewellery refund and returns policy — 30-day cancellation window, return conditions, and how to arrange a return.',
};

const EXCLUDED_ITEMS = [
  'Engraved or personalised items (unless faulty)',
  'Bespoke or made-to-order commissions',
  'Items intended for piercings',
  'Pierced jewellery with opened packaging',
  'Custom-sized rings outside our standard size range',
  'Special order pieces made to your specific requirements',
];

export default function RefundPolicyPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{ backgroundColor: '#faf8f4', borderBottom: '1px solid #e8e0d0', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Returns &amp; Cancellations
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.5rem', fontWeight: 400, margin: '0 0 16px' }}>
          Refund Policy
        </h1>
        <p style={{ fontSize: '14px', color: '#555', maxWidth: '560px', margin: '0 auto', lineHeight: 1.8 }}>
          We want you to be completely happy with your purchase. If for any reason you are not satisfied, please read our returns policy below.
        </p>
      </section>

      <section style={{ padding: '56px 24px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>

          {/* 30-day right */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Your Right to Cancel
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            You have <strong>30 days</strong> from the date you receive your goods to cancel your order and return the item, without needing to provide a reason. We do ask that you let us know why you are returning the item as this helps us improve, but it is not a requirement.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            To exercise your right to cancel, please contact us by phone or email before sending the item back. We will confirm the return address and provide any instructions needed.
          </p>

          {/* Conditions */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Return Conditions
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            All returned items must be in <strong>original, unworn condition</strong>. Rings may be tried on briefly to check size and fit, but any visible scratching, wear, or use beyond inspection will disqualify the item from a full refund.
          </p>
          <div style={{ backgroundColor: '#faf8f4', border: '1px solid #e8e0d0', padding: '20px 24px', marginBottom: '16px', fontSize: '13px', color: '#555', lineHeight: 1.85 }}>
            Wearing a ring for an event, ceremony, or daily use — even once — will be treated as use of the item and may affect your eligibility for a refund.
          </div>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            Items must be returned in their original packaging wherever possible.
          </p>

          {/* Exclusions */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Items That Cannot Be Returned
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            For hygiene, personalisation, or manufacturing reasons, the following items are excluded from our standard returns policy:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '40px' }}>
            {EXCLUDED_ITEMS.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#C9A84C', borderRadius: '50%', marginTop: '7px', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.8, margin: 0 }}>{item}</p>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            Please note that our <Link href="/free-ring-sizing" style={{ color: '#C9A84C' }}>free ring sizing service</Link> still applies to engraved and personalised rings within a two-size difference in the first 30 days — even though standard returns are not available on these items.
          </p>

          {/* Refund timeline */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Refund Timeline
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            Once we have received and inspected the returned item, we will process your refund within <strong>14 days</strong>. The refund will be issued using the same payment method used for the original purchase. No additional fees are charged.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            You will receive an email confirmation once the refund has been issued. Please allow a few additional business days for the funds to appear in your account depending on your bank or card provider.
          </p>

          {/* Return shipping */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Return Shipping
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            Return postage costs are the responsibility of the customer. We <strong>strongly recommend</strong> using Royal Mail Special Delivery or an equivalent fully insured and tracked courier service. Jewellery is valuable and items remain your responsibility until they are safely received by us.
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            We cannot accept responsibility for items lost or damaged in transit on the return journey. Please retain your proof of postage until the refund has been confirmed.
          </p>

          {/* Faulty items */}
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '16px' }}>
            Faulty or Damaged Items
          </h2>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
            If your item arrives damaged or with a manufacturing defect, please contact us within 7 days of receipt. We will arrange for a free return, replacement, or full refund as appropriate. Please include a photograph of the fault when you get in touch so we can resolve this as quickly as possible.
          </p>

          {/* How to return */}
          <div style={{ backgroundColor: '#C9A84C', padding: '28px 32px', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.25rem', fontWeight: 400, color: '#000', margin: '0 0 12px' }}>
              How to Arrange a Return
            </h2>
            <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: 1.85, margin: '0 0 8px' }}>
              Contact us before sending any item back:
            </p>
            <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: 2, margin: 0 }}>
              <strong>Phone:</strong> <a href="tel:+442071234567" style={{ color: '#000' }}>+44 (0) 20 7123 4567</a><br />
              <strong>Email:</strong> <a href="mailto:returns@brmjewellery.co.uk" style={{ color: '#000' }}>returns@brmjewellery.co.uk</a><br />
              <strong>Hours:</strong> Mon–Sat 10am–6pm
            </p>
          </div>

          {/* Contact strip */}
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
