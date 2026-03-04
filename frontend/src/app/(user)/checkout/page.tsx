'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { userOrderApi } from '@/api/order.user.api';
import { paymentApi } from '@/api/payment.api';
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

function PaymentForm({ clientSecret, orderId, onSuccess }: { clientSecret: string; orderId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?orderId=${orderId}` },
    });
    if (error) { toast.error(error.message || 'Payment failed'); setPaying(false); }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <PaymentElement />
      <button type="submit" disabled={paying || !stripe}
        className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60">
        <Lock size={14} /> {paying ? 'Processing…' : `Pay ${''}`}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, count, clearCart } = useCart();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [delivery, setDelivery] = useState('STANDARD');
  const [clientSecret, setClientSecret] = useState('');
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
      const createdOrderId = orderRes.data.data.id;
      setOrderId(createdOrderId);

      const paymentRes = await paymentApi.createIntent(createdOrderId);
      setClientSecret(paymentRes.data.data.clientSecret);
      setStep('payment');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create order');
    } finally { setCreating(false); }
  };

  const handleSuccess = () => {
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

          {step === 'payment' && clientSecret && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-ink mb-4">Payment Details</h2>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-5">
                <Lock size={11} /> Secured by Stripe — Your card details are encrypted
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#C9A84C', fontFamily: 'Didact Gothic, sans-serif', borderRadius: '2px' } } }}>
                <PaymentForm clientSecret={clientSecret} orderId={orderId} onSuccess={handleSuccess} />
              </Elements>
              <button onClick={() => setStep('address')} className="mt-4 text-xs text-ink-muted hover:text-gold transition-colors">
                ← Back to delivery
              </button>
            </div>
          )}
        </div>

        {/* Order Summary - desktop */}
        <div className="lg:col-span-2">
          {/* Mobile toggle */}
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
