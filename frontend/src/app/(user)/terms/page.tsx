import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-gold text-xs uppercase tracking-widest mb-3">Legal</p>
      <h1 className="font-cormorant text-4xl font-light text-ink mb-2">Terms & Conditions</h1>
      <p className="text-xs text-ink-muted mb-10">Last updated: January 2025</p>

      <div className="space-y-8 text-sm text-ink-muted leading-relaxed">

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">1. Introduction</h2>
          <p>These terms and conditions govern your use of the BRM Jewellery website (brmjewellery.com) and your purchase of products from BRM Jewellery Ltd ("BRM", "we", "us"). By placing an order or using our website, you agree to these terms. Please read them carefully before purchasing.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">2. About Us</h2>
          <p>BRM Jewellery Ltd is registered in England and Wales. Our address is Hatton Garden, London, EC1N 8HN. VAT registered. You can contact us at <a href="mailto:hello@brmjewellery.co.uk" className="text-gold hover:underline">hello@brmjewellery.co.uk</a>.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">3. Orders</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All orders are subject to availability and acceptance. We reserve the right to refuse or cancel an order at any time.</li>
            <li>A contract is formed when we confirm your order by email and dispatch the goods.</li>
            <li>Prices are in GBP and include VAT at the current UK rate. Delivery is free on all UK orders.</li>
            <li>We reserve the right to correct pricing errors. If an error affects your order, we will contact you before proceeding.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">4. Payment</h2>
          <p>Payment is taken at the time of order for standard products. We accept Visa, Mastercard, Apple Pay, Google Pay, PayPal, Klarna, Clearpay, and bank transfer. For bank transfer orders, we reserve your item for 3 business days pending receipt of payment.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">5. Delivery</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>We aim to dispatch within 1–2 business days for in-stock items. Bespoke and made-to-order pieces take longer — timelines are confirmed at the point of commission.</li>
            <li>We deliver to UK addresses only. Delivery timescales are estimates, not guarantees.</li>
            <li>Risk in the goods passes to you on delivery. Ownership passes once full payment is received.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">6. Returns & Cancellations</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You have the right to cancel your order within 14 days of delivery under the Consumer Contracts Regulations 2013, provided the item is unworn and unaltered.</li>
            <li>To cancel, contact us at <a href="mailto:hello@brmjewellery.co.uk" className="text-gold hover:underline">hello@brmjewellery.co.uk</a> within 14 days. Return postage is at your cost unless the item is faulty.</li>
            <li>Bespoke, engraved, and specially commissioned items are exempt from the right to cancel (as permitted by law).</li>
            <li>Refunds are issued within 14 days of receiving the returned goods in satisfactory condition.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">7. Product Descriptions</h2>
          <p>We take care to accurately describe our products. Slight variations in colour between product images and the actual item may occur due to photography lighting and screen settings. Carat weights and gemstone measurements are approximate. All items are hallmarked where required by UK law.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">8. Bespoke Commissions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Bespoke orders require a deposit (typically 50%) before work begins. The balance is due on completion.</li>
            <li>Once a bespoke design is approved by the customer and manufacture begins, the order cannot be cancelled.</li>
            <li>Timelines given for bespoke work are estimates. We will communicate any significant delays.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">9. Intellectual Property</h2>
          <p>All content on this website — including images, text, designs, and branding — is the intellectual property of BRM Jewellery Ltd and may not be reproduced without our written consent.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">10. Limitation of Liability</h2>
          <p>Our liability for any defective product is limited to the price paid for that product. We are not liable for indirect, consequential, or special losses. Nothing in these terms limits liability for death, personal injury, or fraud.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">11. Governing Law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes are subject to the exclusive jurisdiction of the courts of England and Wales.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">12. Changes</h2>
          <p>We may update these terms at any time. The version in force at the time of your order will apply to that order.</p>
        </section>

        <div className="border-t border-gold/10 pt-8">
          <p className="text-xs">For questions about these terms, contact us at <a href="mailto:hello@brmjewellery.co.uk" className="text-gold hover:underline">hello@brmjewellery.co.uk</a> or see our <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.</p>
        </div>
      </div>
    </div>
  );
}
