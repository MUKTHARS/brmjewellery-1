'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    section: 'Orders & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 working days. Express delivery is 1–2 working days, and Next Day is available on orders placed before 1pm. All UK deliveries are free of charge.' },
      { q: 'Do you deliver outside the UK?', a: 'Currently we deliver within the United Kingdom only. We are working on international shipping and will announce when it becomes available.' },
      { q: 'How will my jewellery be packaged?', a: 'All orders are dispatched in our signature BRM gift box with a microfibre pouch and care card, wrapped in tissue paper and placed in a secure outer carton.' },
      { q: 'Can I track my order?', a: 'Yes. Once dispatched, you will receive an email with your tracking number. You can monitor delivery progress from your account under My Orders.' },
    ],
  },
  {
    section: 'Products & Jewellery',
    items: [
      { q: 'Are your pieces hallmarked?', a: 'Yes. All gold, silver, and platinum pieces are independently tested and hallmarked by the London Assay Office in accordance with UK hallmarking law.' },
      { q: 'What metals do you use?', a: 'We work with 9k, 14k, 18k, 22k, and 24k gold (yellow, white, and rose), 925 sterling silver, and 950 platinum. All metals are ethically sourced.' },
      { q: 'Are your diamonds and gemstones certified?', a: 'Yes. All diamonds above 0.3ct are supplied with GIA or IGI certificates. Coloured gemstones are accompanied by a gemological report on request.' },
      { q: 'Do you offer ring resizing?', a: 'Yes, we offer resizing within two sizes for rings purchased from us. Please contact us within 30 days of purchase. Resizing beyond two sizes may incur a small fee.' },
    ],
  },
  {
    section: 'Bespoke & Custom Orders',
    items: [
      { q: 'How does the bespoke process work?', a: 'Submit your enquiry via our Bespoke page with your ideas, metal preferences, and budget. We will contact you to discuss the design, provide a quote, and — once approved — begin crafting your piece.' },
      { q: 'How long does a bespoke piece take?', a: 'Typical bespoke commissions take 4–8 weeks depending on complexity. We will give you a precise timeline when we confirm your order.' },
      { q: 'Can I see a preview before it is made?', a: 'Yes. For bespoke commissions we provide a detailed CAD rendering (3D design preview) for your approval before any metal is touched.' },
      { q: 'What is the minimum budget for bespoke?', a: 'There is no strict minimum, but bespoke work generally starts from £500 due to the design and crafting time involved. We are happy to advise based on your ideas.' },
    ],
  },
  {
    section: 'Returns & Payments',
    items: [
      { q: 'What is your returns policy?', a: 'We accept returns within 30 days for unworn, unaltered items in original packaging. Bespoke and engraved items are non-returnable. Please contact us to arrange a return.' },
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, Apple Pay, Google Pay, PayPal, Klarna (Pay in 3), and Clearpay (Pay in 4). Bank transfer is also available.' },
      { q: 'Is your website secure?', a: 'Yes. Our website uses SSL encryption. Payment data is never stored on our servers — all transactions are processed by fully PCI-DSS compliant payment providers.' },
      { q: 'Do you offer Klarna or Buy Now Pay Later?', a: 'Yes. Klarna Pay in 3 and Clearpay Pay in 4 are both available at checkout, allowing you to spread the cost interest-free.' },
    ],
  },
  {
    section: 'Appointments & Visits',
    items: [
      { q: 'Can I visit your workshop in person?', a: 'Yes, we welcome visitors to our workshop by appointment. Please book in advance using our Appointments page so we can give you our full attention.' },
      { q: 'What happens at an appointment?', a: 'Appointments are private consultations — you can browse our collection, discuss a bespoke design, or simply get expert advice on jewellery care and selection. No obligation to purchase.' },
      { q: 'How far in advance should I book?', a: 'We recommend booking at least 2–3 days ahead. For weekends, earlier booking is advised as slots fill quickly.' },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gold/10">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-gold transition-colors">
        <span className="text-sm font-medium text-ink">{q}</span>
        {open ? <ChevronUp size={16} className="text-gold flex-shrink-0" /> : <ChevronDown size={16} className="text-ink-muted flex-shrink-0" />}
      </button>
      {open && (
        <div className="pb-4 pr-8">
          <p className="text-sm text-ink-muted leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div>
      <section className="bg-cream border-b border-gold/10 py-16 px-4 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.4em] mb-3">Help Centre</p>
        <h1 className="font-cormorant text-5xl font-light text-ink mb-4">Frequently Asked Questions</h1>
        <p className="text-ink-muted text-sm max-w-md mx-auto">
          Answers to the questions we hear most often. Cannot find what you need?{' '}
          <Link href="/contact" className="text-gold hover:underline">Contact us directly.</Link>
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {FAQS.map((section) => (
          <div key={section.section}>
            <h2 className="text-xs uppercase tracking-widest font-semibold text-gold mb-4">{section.section}</h2>
            <div>
              {section.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <section className="bg-cream border-t border-gold/10 py-12 px-4 text-center">
        <p className="text-ink font-medium mb-2">Still have questions?</p>
        <p className="text-ink-muted text-sm mb-6">Our team is happy to help with anything not covered above.</p>
        <Link href="/contact" className="btn-gold inline-flex items-center gap-2 px-8 py-3 text-sm">Get in Touch</Link>
      </section>
    </div>
  );
}
