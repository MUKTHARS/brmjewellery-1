'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Lock, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { userOrderApi } from '@/api/order.user.api';
import { paymentApi } from '@/api/payment.api';
import { paypalApi } from '@/api/paypal.api';
import { formatGBP } from '@/lib/formatCurrency';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 5.99;
const VAT_RATE = 0.2;

const DELIVERY_OPTIONS = [
  { value: 'STANDARD', label: 'Standard Delivery', sub: '3–5 working days', price: (sub: number) => sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST },
  { value: 'EXPRESS', label: 'Express Delivery', sub: '1–2 working days', price: () => 9.99 },
  { value: 'NEXT_DAY', label: 'Next Day', sub: 'Order before 1pm', price: () => 14.99 },
];

// ── Stripe payment form ───────────────────────────────────────────────────────
function StripePaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [elementReady, setElementReady] = useState(false);

  // Fallback: enable button after 5s if onReady hasn't fired (e.g. slow network)
  useEffect(() => {
    const t = setTimeout(() => setElementReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !elementReady) return;
    setPaying(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?orderId=${orderId}` },
    });
    if (error) { toast.error(error.message || 'Payment failed'); setPaying(false); }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {!elementReady && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <PaymentElement onReady={() => setElementReady(true)} />
      <button type="submit" disabled={paying || !stripe || !elementReady}
        className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60">
        <Lock size={14} /> {paying ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}

// ── PayPal buttons ────────────────────────────────────────────────────────────
function PayPalCheckoutButtons({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending) return (
    <div className="flex items-center justify-center py-8">
      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal', height: 48 }}
      createOrder={async () => {
        const res = await paypalApi.createOrder(orderId);
        return res.data.data.paypalOrderId as string;
      }}
      onApprove={async (data) => {
        await paypalApi.captureOrder(data.orderID);
        onSuccess();
      }}
      onError={(err) => {
        console.error('PayPal error', err);
        toast.error('PayPal payment failed. Please try again.');
      }}
      onCancel={() => toast.error('Payment cancelled')}
    />
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, count, clearCart } = useCart();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [delivery, setDelivery] = useState('STANDARD');
  const [clientSecret, setClientSecret] = useState('');
  const [fetchingIntent, setFetchingIntent] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [creating, setCreating] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [address, setAddress] = useState({ firstName: '', lastName: '', line1: '', line2: '', city: '', county: '', postcode: '', country: 'GB' });
  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setAddress((a) => ({ ...a, [k]: e.target.value }));

  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?redirect=/checkout`);
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && count === 0) router.push('/cart');
  }, [count, authLoading, router]);

  // Lazy-fetch Stripe intent only when Stripe tab is active on payment step
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'stripe' && orderId && !clientSecret) {
      setFetchingIntent(true);
      paymentApi.createIntent(orderId)
        .then((res) => setClientSecret(res.data.data.clientSecret))
        .catch(() => toast.error('Failed to initialise payment'))
        .finally(() => setFetchingIntent(false));
    }
  }, [step, paymentMethod, orderId, clientSecret]);

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.value === delivery)!;
  const shippingCost = selectedDelivery.price(subtotal);
  const vatAmount = parseFloat((subtotal * VAT_RATE).toFixed(2));
  const total = parseFloat((subtotal + vatAmount + shippingCost).toFixed(2));

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const orderRes = await userOrderApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: { line1: address.line1, line2: address.line2 || undefined, city: address.city, county: address.county || undefined, postcode: address.postcode, country: address.country },
        deliveryMethod: delivery,
      });
      setOrderId(orderRes.data.data.id);
      setStep('payment');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create order');
    } finally { setCreating(false); }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  };

  if (authLoading || count === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const OrderSummary = () => (
    <div className="space-y-3 text-sm">
      {items.map((item) => (
        <div key={item.productId} className="flex gap-3">
          <div className="w-14 h-14 flex-shrink-0 bg-cream overflow-hidden">
            {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink line-clamp-2">{item.title}</p>
            <p className="text-xs text-ink-muted mt-0.5">Qty {item.quantity}</p>
          </div>
          <p className="text-xs tabular-nums font-medium">{formatGBP(item.price * item.quantity)}</p>
        </div>
      ))}
      <div className="border-t border-gold/10 pt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-ink-muted"><span>Subtotal</span><span>{formatGBP(subtotal)}</span></div>
        <div className="flex justify-between text-xs text-ink-muted"><span>VAT (20%)</span><span>{formatGBP(vatAmount)}</span></div>
        <div className="flex justify-between text-xs text-ink-muted"><span>Delivery</span><span>{shippingCost === 0 ? 'FREE' : formatGBP(shippingCost)}</span></div>
        <div className="flex justify-between text-sm font-semibold pt-1.5 border-t border-gold/10">
          <span>Total</span><span>{formatGBP(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-2">
          <span className="font-cormorant text-2xl tracking-[0.3em] text-ink">BRM</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-xs text-ink-muted">
          <span className={step === 'address' ? 'text-gold font-medium' : ''}>1. Delivery</span>
          <div className="w-12 h-px bg-gold/20" />
          <span className={step === 'payment' ? 'text-gold font-medium' : ''}>2. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form */}
        <div className="lg:col-span-3">

          {/* ── Step 1: Address + Delivery ── */}
          {step === 'address' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-ink mb-4">Delivery Address</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-base">First Name</label><input required value={address.firstName} onChange={setField('firstName')} className="input-base" /></div>
                  <div><label className="label-base">Last Name</label><input required value={address.lastName} onChange={setField('lastName')} className="input-base" /></div>
                </div>
                <div className="mt-3"><label className="label-base">Address Line 1</label><input required value={address.line1} onChange={setField('line1')} className="input-base" /></div>
                <div className="mt-3"><label className="label-base">Address Line 2 <span className="text-ink-muted font-normal">(optional)</span></label><input value={address.line2} onChange={setField('line2')} className="input-base" /></div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="label-base">City</label><input required value={address.city} onChange={setField('city')} className="input-base" /></div>
                  <div><label className="label-base">County <span className="text-ink-muted font-normal">(optional)</span></label><input value={address.county} onChange={setField('county')} className="input-base" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="label-base">Postcode</label><input required value={address.postcode} onChange={setField('postcode')} className="input-base uppercase" /></div>
                  <div><label className="label-base">Country</label><input value="United Kingdom" readOnly className="input-base bg-cream cursor-not-allowed" /></div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-ink mb-4">Delivery Method</h2>
                <div className="space-y-2">
                  {DELIVERY_OPTIONS.map((opt) => (
                    <label key={opt.value} className={`flex items-center justify-between p-3 border cursor-pointer transition-colors ${delivery === opt.value ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="delivery" value={opt.value} checked={delivery === opt.value} onChange={() => setDelivery(opt.value)} className="text-gold" />
                        <div>
                          <p className="text-sm font-medium text-ink">{opt.label}</p>
                          <p className="text-xs text-ink-muted">{opt.sub}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium tabular-nums">
                        {opt.price(subtotal) === 0 ? <span className="text-success">FREE</span> : formatGBP(opt.price(subtotal))}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={creating} className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60">
                {creating ? 'Creating Order…' : `Continue to Payment — ${formatGBP(total)}`}
              </button>
            </form>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 'payment' && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-ink mb-5">Payment Method</h2>

              {/* Method selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {/* Stripe tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex flex-col items-center gap-2 p-4 border transition-colors ${paymentMethod === 'stripe' ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}
                >
                  <CreditCard size={20} className={paymentMethod === 'stripe' ? 'text-gold' : 'text-ink-muted'} />
                  <span className="text-xs font-medium text-ink">Card / Wallet</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {['Visa', 'MC', 'Apple Pay', 'Klarna', 'Clearpay'].map((b) => (
                      <span key={b} className="text-[9px] border border-gold/20 px-1 py-0.5 text-ink-muted rounded-sm">{b}</span>
                    ))}
                  </div>
                </button>

                {/* PayPal tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex flex-col items-center gap-2 p-4 border transition-colors ${paymentMethod === 'paypal' ? 'border-[#009CDE] bg-[#009CDE]/5' : 'border-gold/10 hover:border-gold/30'}`}
                >
                  <svg viewBox="0 0 101 32" className="h-5 w-auto" aria-label="PayPal">
                    <path fill="#003087" d="M12.237 2.6H5.854C5.4 2.6 5.013 2.935 4.94 3.383L2.31 19.93a.782.782 0 0 0 .772.903h3.04c.454 0 .841-.335.913-.783l.682-4.326a.923.923 0 0 1 .913-.783h2.014c4.19 0 6.607-2.028 7.238-6.045.285-1.757.012-3.136-.81-4.103-.902-1.064-2.5-1.192-4.835-1.192zm.734 5.956c-.347 2.277-2.09 2.277-3.776 2.277h-.96l.673-4.26a.554.554 0 0 1 .547-.468h.44c1.148 0 2.23 0 2.789.654.335.39.437.971.287 1.797z"/>
                    <path fill="#003087" d="M35.29 8.47H32.24a.554.554 0 0 0-.547.468l-.14.893-.222-.323c-.688-1-2.22-1.332-3.75-1.332-3.51 0-6.51 2.66-7.094 6.39-.304 1.862.127 3.642 1.18 4.883.968 1.14 2.35 1.614 3.997 1.614 2.829 0 4.399-1.82 4.399-1.82l-.142.888a.782.782 0 0 0 .772.903h2.738c.454 0 .841-.335.913-.783l1.643-10.4a.78.78 0 0 0-.771-.78zm-4.243 6.18c-.307 1.81-1.747 3.026-3.576 3.026-.92 0-1.656-.296-2.128-.856-.47-.556-.646-1.35-.498-2.233.285-1.795 1.747-3.048 3.55-3.048.9 0 1.63.3 2.11.864.483.57.673 1.367.542 2.247z"/>
                    <path fill="#003087" d="M55.43 8.47h-3.062a.928.928 0 0 0-.766.403l-4.42 6.51-1.873-6.256a.93.93 0 0 0-.89-.657h-3.01a.552.552 0 0 0-.524.733l3.527 10.35-3.316 4.678a.552.552 0 0 0 .45.873h3.058a.926.926 0 0 0 .762-.397l10.65-15.38a.55.55 0 0 0-.586-.857z"/>
                    <path fill="#009CDE" d="M67.075 2.6H60.69c-.454 0-.84.335-.913.783L57.147 19.93a.782.782 0 0 0 .772.903h3.261c.318 0 .589-.231.639-.547l.726-4.562a.923.923 0 0 1 .913-.783h2.014c4.19 0 6.607-2.028 7.238-6.045.285-1.757.012-3.136-.81-4.103-.902-1.065-2.5-1.192-4.825-1.192zm.734 5.956c-.347 2.277-2.09 2.277-3.776 2.277h-.96l.672-4.26a.554.554 0 0 1 .547-.468h.44c1.148 0 2.23 0 2.789.654.335.39.436.971.288 1.797z"/>
                    <path fill="#009CDE" d="M90.13 8.47h-3.047a.554.554 0 0 0-.547.468l-.14.893-.223-.323c-.688-1-2.22-1.332-3.75-1.332-3.51 0-6.51 2.66-7.094 6.39-.303 1.862.128 3.642 1.18 4.883.97 1.14 2.35 1.614 3.998 1.614 2.829 0 4.399-1.82 4.399-1.82l-.142.888a.782.782 0 0 0 .772.903h2.738c.454 0 .841-.335.913-.783l1.643-10.4a.782.782 0 0 0-.772-.781zm-4.242 6.18c-.307 1.81-1.748 3.026-3.577 3.026-.919 0-1.655-.296-2.127-.856-.47-.556-.647-1.35-.498-2.233.284-1.795 1.747-3.048 3.55-3.048.9 0 1.63.3 2.11.864.482.57.673 1.367.542 2.247z"/>
                    <path fill="#009CDE" d="M95.354 3.03l-2.662 16.9a.782.782 0 0 0 .772.903h2.617c.454 0 .841-.335.913-.783L99.628 3.5a.782.782 0 0 0-.772-.903h-2.955a.554.554 0 0 0-.547.433z"/>
                  </svg>
                  <span className="text-xs font-medium text-ink">PayPal</span>
                  <span className="text-[9px] border border-blue-200 px-1 py-0.5 text-ink-muted rounded-sm">PayPal checkout</span>
                </button>
              </div>

              {/* Stripe */}
              {paymentMethod === 'stripe' && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-5">
                    <Lock size={11} /> Secured by Stripe — your card details are encrypted
                  </div>
                  {fetchingIntent ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={{
                      clientSecret,
                      locale: 'en-GB',
                      appearance: {
                        theme: 'stripe',
                        variables: { colorPrimary: '#C9A84C', fontFamily: 'Didact Gothic, sans-serif', borderRadius: '2px' },
                      },
                    }}>
                      <StripePaymentForm orderId={orderId} />
                    </Elements>
                  ) : null}
                </div>
              )}

              {/* PayPal */}
              {paymentMethod === 'paypal' && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-5">
                    <Lock size={11} /> You will be redirected to PayPal to complete your payment securely
                  </div>
                  <PayPalScriptProvider options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                    currency: 'GBP',
                    intent: 'capture',
                  }}>
                    <PayPalCheckoutButtons orderId={orderId} onSuccess={handlePaymentSuccess} />
                  </PayPalScriptProvider>
                </div>
              )}

              <button type="button" onClick={() => setStep('address')} className="mt-5 text-xs text-ink-muted hover:text-gold transition-colors">
                ← Back to delivery
              </button>
            </div>
          )}
        </div>

        {/* Order Summary — right column */}
        <div className="lg:col-span-2">
          <button onClick={() => setSummaryOpen(!summaryOpen)} className="lg:hidden w-full flex items-center justify-between border border-gold/10 p-4 mb-4 text-sm">
            <span className="font-medium">Order Summary ({count} items)</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatGBP(total)}</span>
              {summaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </button>

          <div className={`lg:block border border-gold/10 p-5 ${summaryOpen ? 'block' : 'hidden lg:block'}`}>
            <h2 className="text-xs uppercase tracking-widest text-ink mb-4 hidden lg:block">Order Summary</h2>
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
