'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { newsletterApi } from '@/api/newsletter.api';

const STORAGE_KEY = 'brm_entry_popup_dismissed';
const DELAY_MS = 4000;

export default function EntryPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await newsletterApi.subscribe({ email: email.trim() });
      setSubmitted(true);
      setTimeout(dismiss, 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image panel */}
          <div className="hidden md:block aspect-auto overflow-hidden bg-cream">
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80"
              alt="BRM Jewellery"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col justify-center">
            <p className="text-gold text-[10px] uppercase tracking-widest mb-2">Welcome</p>
            <h2 className="font-cormorant text-2xl font-light text-ink mb-3 leading-snug">
              Discover Fine<br />Jewellery
            </h2>

            {!submitted ? (
              <>
                <p className="text-xs text-ink-muted mb-6 leading-relaxed">
                  Subscribe for exclusive access to new collections, bespoke commissions, and members-only offers.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full border border-gold/20 px-3 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 outline-none focus:border-gold transition-colors"
                  />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gold py-2.5 text-xs uppercase tracking-widest disabled:opacity-60"
                  >
                    {loading ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <span className="text-xs text-ink-muted">Already have an account? </span>
                  <Link href="/login" onClick={dismiss} className="text-xs text-gold hover:underline">Sign in</Link>
                </div>
                <div className="mt-2 text-center">
                  <Link href="/register" onClick={dismiss} className="text-xs text-ink-muted hover:text-gold transition-colors">Create an account →</Link>
                </div>
                <button onClick={dismiss} className="mt-4 text-center w-full text-[10px] text-ink-muted/50 hover:text-ink-muted transition-colors">
                  No thanks, continue browsing
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold text-lg">✓</span>
                </div>
                <p className="text-sm text-ink font-medium mb-1">You're on the list</p>
                <p className="text-xs text-ink-muted">Thank you for subscribing. Look out for exclusive offers in your inbox.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
