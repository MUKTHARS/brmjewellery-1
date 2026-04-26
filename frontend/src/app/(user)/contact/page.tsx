'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import { contactApi } from '@/api/contact.api';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'Product Enquiry',
  'Bespoke Design',
  'Order Support',
  'Appointments',
  'Returns & Exchanges',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.submit(form);
      setSubmitted(true);
    } catch {
      toast.error('Failed to send message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-cream border-b border-gold/10 py-16 px-4 text-center">
        <p className="text-gold text-xs uppercase tracking-[0.4em] mb-3">Get in Touch</p>
        <h1 className="font-cormorant text-5xl font-light text-ink mb-4">Contact Us</h1>
        <p className="text-ink-muted text-sm max-w-md mx-auto">
          Whether you have a question about a piece, need help with an order, or want to start a bespoke commission — we are here to help.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-ink font-semibold mb-5">Our Details</h2>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <MapPin size={18} className="text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink">Workshop Address</p>
                    <p className="text-sm text-ink-muted mt-0.5">3 Selkirk Road<br />London, England, SW17 0ER<br />United Kingdom</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Phone size={18} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink">Telephone</p>
                    <a href="tel:+442071234567" className="text-sm text-ink-muted hover:text-gold transition-colors">+44 (0) 20 7123 4567</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Mail size={18} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink">Email</p>
                    <a href="mailto:hello@brmjewellery.co.uk" className="text-sm text-ink-muted hover:text-gold transition-colors">hello@brmjewellery.co.uk</a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Clock size={18} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-ink">Opening Hours</p>
                    <p className="text-sm text-ink-muted mt-0.5">
                      Mon – Fri: 10am – 6pm<br />
                      Saturday: 10am – 5pm<br />
                      Sunday: By appointment
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border border-gold/10 p-5 bg-cream">
              <p className="text-xs uppercase tracking-widest text-ink font-semibold mb-2">Response Time</p>
              <p className="text-xs text-ink-muted leading-relaxed">
                We aim to respond to all enquiries within 24 hours on business days. For urgent matters, please call us directly.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 size={48} className="text-success mb-4" />
                <h2 className="font-cormorant text-3xl font-light text-ink mb-2">Message Sent</h2>
                <p className="text-ink-muted text-sm max-w-sm">
                  Thank you for reaching out. A member of our team will be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xs uppercase tracking-widest text-ink font-semibold mb-5">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">Full Name</label>
                    <input required value={form.name} onChange={set('name')} placeholder="Jane Smith" className="input-base" />
                  </div>
                  <div>
                    <label className="label-base">Email Address</label>
                    <input required type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" className="input-base" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">Phone <span className="text-ink-muted font-normal">(optional)</span></label>
                    <input value={form.phone} onChange={set('phone')} placeholder="+44 7700 000000" className="input-base" />
                  </div>
                  <div>
                    <label className="label-base">Subject</label>
                    <select required value={form.subject} onChange={set('subject')} className="input-base">
                      <option value="">Select a subject…</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-base">Message</label>
                  <textarea required value={form.message} onChange={set('message')} rows={6} placeholder="Tell us how we can help…" className="input-base resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-gold w-full py-3.5 text-sm uppercase tracking-widest disabled:opacity-60">
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
