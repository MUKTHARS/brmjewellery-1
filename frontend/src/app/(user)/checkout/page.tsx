'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { userOrderApi } from '@/api/order.user.api';
import { paymentApi } from '@/api/payment.api';
import { formatGBP } from '@/lib/formatCurrency';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentMethod =
  | 'visa'
  | 'mastercard'
  | 'apple_pay'
  | 'klarna'
  | 'clearpay'
  | 'bank_transfer';

// ── Constants ─────────────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 5.99;
const VAT_RATE = 0.2;

const DELIVERY_OPTIONS = [
  { value: 'STANDARD', label: 'Standard Delivery', sub: '3–5 working days', price: (sub: number) => sub >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST },
  { value: 'EXPRESS', label: 'Express Delivery', sub: '1–2 working days', price: () => 9.99 },
  { value: 'NEXT_DAY', label: 'Next Day', sub: 'Order before 1pm', price: () => 14.99 },
];

const CARD_METHODS: PaymentMethod[] = ['visa', 'mastercard'];
const PENDING_METHODS: PaymentMethod[] = ['klarna', 'clearpay', 'bank_transfer'];

// ── Payment method metadata ───────────────────────────────────────────────────

const PAYMENT_METHODS = [
  {
    id: 'visa' as PaymentMethod,
    label: 'Visa',
    sub: 'Credit & debit',
    icon: (
      <svg viewBox="0 0 780 500" className="h-6 w-auto" aria-label="Visa">
        <rect width="780" height="500" rx="40" fill="#1A1F71"/>
        <path d="M293 348.5L326.5 153H377L343.5 348.5H293Z" fill="white"/>
        <path d="M524 157.3C513.8 153.5 497.8 149.5 477.8 149.5C428.3 149.5 393.3 175.3 393 212.5C392.8 239.8 418.5 254.8 438 263.8C458 273 464.5 279 464.5 287.5C464.3 300.5 448.5 306.3 433.8 306.3C413.5 306.3 402.5 303.3 385.8 296L379 293L371.8 339.3C383.8 344.8 406.3 349.5 429.8 349.8C482.5 349.8 516.8 324.3 517.3 284.5C517.5 262.5 504 245.8 474.5 231.8C456.5 222.8 445.5 216.8 445.5 207.8C445.8 199.5 455.3 191 476.3 191C493.8 190.8 506.5 194.5 516.5 198.3L521.3 200.5L528.3 157L524 157.3Z" fill="white"/>
        <path d="M640.5 153H601C588.5 153 579.3 156.5 574.3 169.3L499.5 348.5H552.3L562.8 319.3L626.5 319.5C628 331.5 637 348.5 637 348.5H684L640.5 153ZM578 281.3C582 270.3 601.3 219.3 601.3 219.3C601 219.8 605.3 208 607.8 200.8L611.3 217.5C611.3 217.5 622.3 269.5 624.5 281.3H578Z" fill="white"/>
        <path d="M244.5 153L195.3 279.5L189.8 252.5C180.3 222 151.8 188.8 120 172.3L164.8 348.3H218L297.5 153H244.5Z" fill="white"/>
        <path d="M147.5 153H65.5L65 156.8C127.5 172.3 169.3 207.5 186.3 252.5L169 169.5C166 156.8 157 153.5 147.5 153Z" fill="#F2AE14"/>
      </svg>
    ),
  },
  {
    id: 'mastercard' as PaymentMethod,
    label: 'Mastercard',
    sub: 'Credit & debit',
    icon: (
      <svg viewBox="0 0 131.39 86.9" className="h-6 w-auto" aria-label="Mastercard">
        <circle cx="43.45" cy="43.45" r="43.45" fill="#EB001B"/>
        <circle cx="87.94" cy="43.45" r="43.45" fill="#F79E1B"/>
        <path d="M65.7 13.15a43.45 43.45 0 0 1 0 60.6 43.45 43.45 0 0 1 0-60.6Z" fill="#FF5F00"/>
      </svg>
    ),
  },
  {
    id: 'apple_pay' as PaymentMethod,
    label: 'Apple Pay',
    sub: 'Touch ID / Face ID',
    icon: (
      <svg viewBox="0 0 165 105" className="h-6 w-auto" aria-label="Apple Pay">
        <rect width="165" height="105" rx="10" fill="#000"/>
        <path d="M60 35c-1.4 1.7-3.7 3-5.9 2.8-.3-2.3.8-4.7 2.1-6.2 1.4-1.7 3.8-3 5.8-3.1.2 2.4-.7 4.8-2 6.5zm1.9 3c-3.3-.2-6.1 1.9-7.7 1.9-1.6 0-4-1.8-6.6-1.7-3.4.1-6.5 2-8.2 5.1-3.5 6.1-.9 15.1 2.5 20 1.6 2.4 3.6 5.1 6.1 5 2.4-.1 3.4-1.6 6.3-1.6s3.8 1.6 6.4 1.5c2.6-.1 4.3-2.4 5.9-4.8 1.9-2.7 2.6-5.3 2.7-5.5-.1 0-5.2-2-5.2-7.8 0-4.9 4-7.2 4.2-7.4-2.3-3.4-5.9-3.7-7.4-3.7z" fill="white"/>
        <text x="90" y="62" fontFamily="system-ui" fontSize="28" fontWeight="600" fill="white">Pay</text>
      </svg>
    ),
  },
  {
    id: 'klarna' as PaymentMethod,
    label: 'Klarna',
    sub: 'Pay in 3 — interest free',
    icon: (
      <svg viewBox="0 0 512 170" className="h-5 w-auto" aria-label="Klarna">
        <rect width="512" height="170" fill="#FFB3C7"/>
        <text x="30" y="120" fontFamily="system-ui" fontSize="90" fontWeight="800" fill="#000">klarna</text>
      </svg>
    ),
  },
  {
    id: 'clearpay' as PaymentMethod,
    label: 'Clearpay',
    sub: 'Pay in 4 — interest free',
    icon: (
      <svg viewBox="0 0 512 170" className="h-5 w-auto" aria-label="Clearpay">
        <rect width="512" height="170" fill="#B2FCE4"/>
        <text x="20" y="120" fontFamily="system-ui" fontSize="80" fontWeight="800" fill="#000">Clearpay</text>
      </svg>
    ),
  },
  {
    id: 'bank_transfer' as PaymentMethod,
    label: 'Bank Transfer',
    sub: 'UK bank transfer',
    icon: <Building2 size={24} className="text-ink" />,
  },
];

// ── Card form (visual only — payment collected via terminal) ──────────────────

function CardForm({ method, total, onPay, paying }: {
  method: PaymentMethod;
  total: number;
  onPay: () => void;
  paying: boolean;
}) {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  };

  const cardLabel = method === 'visa' ? 'Visa' : 'Mastercard';

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        Your card details are used to confirm your identity. Payment will be collected via our secure in-store terminal when your order is fulfilled.
      </p>
      <div>
        <label className="label-base">Name on Card</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="J. Smith"
          className="input-base"
        />
      </div>
      <div>
        <label className="label-base">{cardLabel} Card Number</label>
        <input
          value={number}
          onChange={(e) => setNumber(formatNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          maxLength={19}
          className="input-base font-mono tracking-widest"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-base">Expiry Date</label>
          <input
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM / YY"
            inputMode="numeric"
            maxLength={7}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">CVV</label>
          <input
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            inputMode="numeric"
            maxLength={4}
            className="input-base"
            type="password"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onPay}
        disabled={paying || !name || number.replace(/\s/g, '').length < 16 || expiry.length < 7 || cvv.length < 3}
        className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60"
      >
        <Lock size={14} />
        {paying ? 'Processing…' : `Pay ${formatGBP(total)}`}
      </button>
    </div>
  );
}

// ── Apple Pay (simulated — marks order PAID, terminal collects) ───────────────

function ApplePayButton({ total, onPay, paying }: { total: number; onPay: () => void; paying: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        Confirm your order and pay quickly using Touch ID or Face ID. Payment is collected via our in-store terminal upon fulfilment.
      </p>
      <button
        type="button"
        onClick={onPay}
        disabled={paying}
        className="w-full bg-black text-white py-3.5 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60 rounded-sm"
      >
        {paying ? (
          <span>Processing…</span>
        ) : (
          <>
            <svg viewBox="0 0 20 14" className="h-4 w-auto fill-white" aria-hidden="true">
              <path d="M10 1.5c-.8 1-2.1 1.8-3.4 1.7-.2-1.3.5-2.7 1.2-3.6C8.7-.3 10.1-.1 10 1.5zm.9 1.7c-1.9-.1-3.5 1.1-4.4 1.1-.9 0-2.3-1-3.8-1C.9 4.4-.1 5.5-.1 7.2c0 3.5 3 8.8 4.6 8.8.9 0 1.3-.6 2.5-.6s1.6.6 2.6.6c1.6 0 4.6-5.1 4.6-8.8 0-2-.9-3.9-3.3-4z"/>
            </svg>
            <span>Pay {formatGBP(total)} with Apple Pay</span>
          </>
        )}
      </button>
    </div>
  );
}

// ── Klarna instalment form ────────────────────────────────────────────────────

function KlarnaForm({ total, onPay, paying }: { total: number; onPay: () => void; paying: boolean }) {
  const instalment = parseFloat((total / 3).toFixed(2));
  const today = new Date();
  const d30 = new Date(today); d30.setDate(today.getDate() + 30);
  const d60 = new Date(today); d60.setDate(today.getDate() + 60);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        Split your purchase into 3 equal interest-free instalments. Bank transfer instructions will be emailed to you.
      </p>
      <div className="border border-gold/10 divide-y divide-gold/10">
        {[
          { label: 'Today', date: fmt(today), amount: instalment },
          { label: '2nd payment', date: fmt(d30), amount: instalment },
          { label: '3rd payment', date: fmt(d60), amount: parseFloat((total - instalment * 2).toFixed(2)) },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-xs">
            <span className="text-ink font-medium">{row.label}</span>
            <span className="text-ink-muted">{row.date}</span>
            <span className="font-semibold tabular-nums">{formatGBP(row.amount)}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onPay}
        disabled={paying}
        className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest disabled:opacity-60 bg-[#FFB3C7] text-black hover:bg-[#ff9ab8] transition-colors"
      >
        <Lock size={14} />
        {paying ? 'Processing…' : `Pay with Klarna — ${formatGBP(instalment)} today`}
      </button>
    </div>
  );
}

// ── Clearpay instalment form ──────────────────────────────────────────────────

function ClearpayForm({ total, onPay, paying }: { total: number; onPay: () => void; paying: boolean }) {
  const instalment = parseFloat((total / 4).toFixed(2));
  const today = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const offsets = [0, 14, 28, 42];

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        Split your purchase into 4 equal interest-free payments. Bank transfer instructions will be emailed to you.
      </p>
      <div className="border border-gold/10 divide-y divide-gold/10">
        {offsets.map((days, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + days);
          const amount = i === 3 ? parseFloat((total - instalment * 3).toFixed(2)) : instalment;
          return (
            <div key={days} className="flex items-center justify-between px-4 py-2.5 text-xs">
              <span className="text-ink font-medium">{i === 0 ? 'Today' : `Payment ${i + 1}`}</span>
              <span className="text-ink-muted">{fmt(d)}</span>
              <span className="font-semibold tabular-nums">{formatGBP(amount)}</span>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onPay}
        disabled={paying}
        className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest disabled:opacity-60 bg-[#B2FCE4] text-black hover:bg-[#8af5d0] transition-colors"
      >
        <Lock size={14} />
        {paying ? 'Processing…' : `Pay with Clearpay — ${formatGBP(instalment)} today`}
      </button>
    </div>
  );
}

// ── Bank Transfer form ────────────────────────────────────────────────────────

function BankTransferForm({ onPay, paying }: { onPay: () => void; paying: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        Your order will be reserved while we await your bank transfer. Full payment instructions — including sort code, account number, and reference — will be emailed to you immediately after placing your order.
      </p>
      <div className="bg-gold/5 border border-gold/20 p-4 space-y-2 text-sm">
        <p className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Bank Details</p>
        <div className="flex justify-between text-xs">
          <span className="text-ink-muted">Account Name</span>
          <span className="font-medium text-ink">BRM Jewellery Ltd</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-muted">Sort Code</span>
          <span className="font-mono font-medium text-ink">20-00-00</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-muted">Account Number</span>
          <span className="font-mono font-medium text-ink">12345678</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-muted">Reference</span>
          <span className="font-medium text-ink">Your order number (emailed)</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onPay}
        disabled={paying}
        className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60"
      >
        <Lock size={14} />
        {paying ? 'Processing…' : 'Place Order — Pay by Bank Transfer'}
      </button>
    </div>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, count, clearCart } = useCart();

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('visa');
  const [delivery, setDelivery] = useState('STANDARD');
  const [orderId, setOrderId] = useState('');
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [address, setAddress] = useState({
    firstName: '', lastName: '', line1: '', line2: '',
    city: '', county: '', postcode: '', country: 'GB',
  });
  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [k]: e.target.value }));

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?redirect=/checkout');
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
        shippingAddress: {
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          county: address.county || undefined,
          postcode: address.postcode,
          country: address.country,
        },
        deliveryMethod: delivery,
      });
      setOrderId(orderRes.data.data.id);
      setStep('payment');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  }, [clearCart, router, orderId]);

  const handlePay = useCallback(async () => {
    setPaying(true);
    try {
      await paymentApi.process(orderId, selectedMethod);
      handlePaymentSuccess();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  }, [orderId, selectedMethod, handlePaymentSuccess]);

  if (authLoading || count === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isPending = PENDING_METHODS.includes(selectedMethod);

  const securityNote = (() => {
    if (CARD_METHODS.includes(selectedMethod)) return 'Card details collected for identity verification — payment via secure terminal';
    if (selectedMethod === 'apple_pay') return 'Apple Pay — payment collected via our secure in-store terminal';
    if (selectedMethod === 'klarna') return 'Klarna Pay in 3 — 3 interest-free bank transfer instalments';
    if (selectedMethod === 'clearpay') return 'Clearpay — 4 interest-free bank transfer payments';
    if (selectedMethod === 'bank_transfer') return 'Bank transfer — payment instructions sent by email';
    return '';
  })();

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

              <button type="submit" disabled={creating}
                className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60">
                {creating ? 'Creating Order…' : `Continue to Payment — ${formatGBP(total)}`}
              </button>
            </form>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 'payment' && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-ink mb-5">Payment Method</h2>

              {/* Payment method grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center gap-2 p-3 border transition-colors text-center ${
                      selectedMethod === method.id
                        ? 'border-gold bg-gold/5'
                        : 'border-gold/10 hover:border-gold/30'
                    }`}
                  >
                    <div className="h-7 flex items-center justify-center">{method.icon}</div>
                    <span className="text-xs font-semibold text-ink leading-tight">{method.label}</span>
                    <span className="text-[10px] text-ink-muted leading-tight">{method.sub}</span>
                  </button>
                ))}
              </div>

              {/* Security note */}
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-5">
                <Lock size={11} />
                <span>{securityNote}</span>
              </div>

              {/* Pending order notice */}
              {isPending && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 mb-5 rounded-sm">
                  Your order will be reserved and a confirmation email sent immediately. Please complete the bank transfer within 3 days to confirm your order.
                </div>
              )}

              {/* ── Card forms (Visa / Mastercard) ── */}
              {CARD_METHODS.includes(selectedMethod) && (
                <CardForm method={selectedMethod} total={total} onPay={handlePay} paying={paying} />
              )}

              {/* ── Apple Pay ── */}
              {selectedMethod === 'apple_pay' && (
                <ApplePayButton total={total} onPay={handlePay} paying={paying} />
              )}

              {/* ── Klarna ── */}
              {selectedMethod === 'klarna' && (
                <KlarnaForm total={total} onPay={handlePay} paying={paying} />
              )}

              {/* ── Clearpay ── */}
              {selectedMethod === 'clearpay' && (
                <ClearpayForm total={total} onPay={handlePay} paying={paying} />
              )}

              {/* ── Bank Transfer ── */}
              {selectedMethod === 'bank_transfer' && (
                <BankTransferForm onPay={handlePay} paying={paying} />
              )}

              <button type="button" onClick={() => setStep('address')}
                className="mt-5 text-xs text-ink-muted hover:text-gold transition-colors">
                ← Back to delivery
              </button>
            </div>
          )}
        </div>

        {/* Order Summary — right column */}
        <div className="lg:col-span-2">
          <button onClick={() => setSummaryOpen(!summaryOpen)}
            className="lg:hidden w-full flex items-center justify-between border border-gold/10 p-4 mb-4 text-sm">
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
