import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-gold text-xs uppercase tracking-widest mb-3">Legal</p>
      <h1 className="font-cormorant text-4xl font-light text-ink mb-2">Privacy Policy</h1>
      <p className="text-xs text-ink-muted mb-10">Last updated: January 2025</p>

      <div className="prose prose-sm max-w-none space-y-8 text-ink-muted leading-relaxed">

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">1. Who We Are</h2>
          <p>BRM Jewellery Ltd ("BRM", "we", "us", "our") is a company registered in England and Wales. Our registered address is Hatton Garden, London, EC1N 8HN. We operate the website brmjewellery.com.</p>
          <p className="mt-2">For questions about this policy, contact us at: <a href="mailto:privacy@brmjewellery.co.uk" className="text-gold hover:underline">privacy@brmjewellery.co.uk</a></p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">2. Data We Collect</h2>
          <p>We collect the following personal data when you use our website:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Account data:</strong> name, email address, password (hashed), and optionally a phone number when you create an account.</li>
            <li><strong>Order data:</strong> delivery address, payment method (not card numbers), and order history.</li>
            <li><strong>Enquiry data:</strong> name, contact details, and messages submitted via contact or bespoke forms.</li>
            <li><strong>Newsletter data:</strong> email address when you subscribe.</li>
            <li><strong>Technical data:</strong> IP address, browser type, and pages visited, collected automatically via server logs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To process and fulfil your orders, including sending invoices and tracking updates.</li>
            <li>To respond to enquiries and bespoke commission requests.</li>
            <li>To send transactional emails (order confirmations, shipping notifications).</li>
            <li>To send marketing emails if you have opted in (you may unsubscribe at any time).</li>
            <li>To improve our website and customer experience.</li>
            <li>To comply with our legal obligations under UK law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">4. Legal Basis for Processing</h2>
          <p>We process your data under the following legal bases as defined by the UK GDPR:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Contract:</strong> processing necessary to fulfil orders you have placed.</li>
            <li><strong>Legitimate interests:</strong> fraud prevention, security, and improving our services.</li>
            <li><strong>Consent:</strong> marketing communications (you may withdraw consent at any time).</li>
            <li><strong>Legal obligation:</strong> retaining financial records as required by HMRC.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">5. Data Sharing</h2>
          <p>We do not sell your personal data. We share data only with trusted third parties where necessary:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Payment processors:</strong> PayPal, Klarna, Afterpay/Clearpay — who process payments on our behalf.</li>
            <li><strong>Courier services:</strong> DHL, FedEx, Royal Mail — to fulfil deliveries.</li>
            <li><strong>Email provider:</strong> for transactional and marketing emails.</li>
          </ul>
          <p className="mt-2">All third parties are contractually required to protect your data in accordance with UK GDPR.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">6. Data Retention</h2>
          <p>We retain your data for as long as necessary:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Account data: for the life of your account plus 2 years after deletion.</li>
            <li>Order records: 7 years (HMRC requirement).</li>
            <li>Marketing consent: until you unsubscribe.</li>
            <li>Enquiry data: 2 years from submission.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">7. Your Rights</h2>
          <p>Under UK GDPR, you have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request erasure ("right to be forgotten").</li>
            <li>Object to processing or request restriction.</li>
            <li>Data portability (receive your data in a structured format).</li>
            <li>Withdraw consent for marketing at any time.</li>
          </ul>
          <p className="mt-2">To exercise any right, contact us at <a href="mailto:privacy@brmjewellery.co.uk" className="text-gold hover:underline">privacy@brmjewellery.co.uk</a>. We will respond within 30 days.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">8. Cookies</h2>
          <p>We use only essential cookies required for the website to function (session management, cart persistence). We do not use tracking or advertising cookies. No third-party analytics scripts are loaded without your consent.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">9. Security</h2>
          <p>We use industry-standard security measures including SSL/TLS encryption, hashed passwords, and access controls. Payment card data is never stored on our servers — all card processing is handled by PCI-DSS compliant providers.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">10. Changes to This Policy</h2>
          <p>We may update this policy periodically. Significant changes will be communicated by email to registered account holders. The "last updated" date at the top of this page reflects the most recent revision.</p>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink mb-3">11. Complaints</h2>
          <p>If you are unhappy with how we handle your data, you have the right to complain to the UK's data protection authority, the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
        </section>

      </div>
    </div>
  );
}
