'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Lock, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { userOrderApi } from '@/api/order.user.api';
import { paymentApi } from '@/api/payment.api';
import { paypalApi } from '@/api/paypal.api';
import { formatGBP } from '@/lib/formatCurrency';
import { resolveImageUrl } from '@/lib/resolveImageUrl';
import toast from 'react-hot-toast';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentMethod =
  | 'visa'
  | 'mastercard'
  | 'apple_pay'
  | 'google_pay'
  | 'paypal'
  | 'klarna'
  | 'clearpay'
  | 'bank_transfer';

// ── Constants ─────────────────────────────────────────────────────────────────

const VAT_RATE = 0.2;

const CARD_METHODS: PaymentMethod[] = ['visa', 'mastercard'];

// ── Script loader ─────────────────────────────────────────────────────────────

const loadScript = (src: string, id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.id = id;
    s.onload = () => resolve(); s.onerror = reject;
    document.head.appendChild(s);
  });

// ── Payment method metadata ───────────────────────────────────────────────────

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    id: 'visa',
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
    id: 'mastercard',
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
    id: 'apple_pay',
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
    id: 'google_pay',
    label: 'Google Pay',
    sub: 'Pay with Google',
    icon: (
      <svg viewBox="0 0 41 17" className="h-5 w-auto" aria-label="Google Pay">
        <text x="0" y="13" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#5F6368">G</text>
        <text x="9" y="13" fontFamily="system-ui" fontSize="13" fontWeight="400" fill="#5F6368">oogle </text>
        <text x="0" y="13" dx="50" fontFamily="system-ui" fontSize="13" fontWeight="600" fill="#5F6368" visibility="hidden">Pay</text>
        <svg x="0" y="0" viewBox="0 0 100 40">
          <text x="2" y="28" fontFamily="sans-serif" fontSize="24" fontWeight="700">
            <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">o</tspan><tspan fill="#4285F4">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
            <tspan fill="#5F6368" fontWeight="400"> Pay</tspan>
          </text>
        </svg>
      </svg>
    ),
  },
  {
    id: 'paypal',
    label: 'PayPal',
    sub: 'Fast & secure',
    icon: (
      <svg viewBox="0 0 101 32" className="h-5 w-auto" aria-label="PayPal">
        <path fill="#003087" d="M12.237 2.6H5.854C5.4 2.6 5.013 2.935 4.94 3.383L2.31 19.93a.782.782 0 0 0 .772.903h3.04c.454 0 .841-.335.913-.783l.682-4.326a.923.923 0 0 1 .913-.783h2.014c4.19 0 6.607-2.028 7.238-6.045.285-1.757.012-3.136-.81-4.103-.902-1.064-2.5-1.192-4.835-1.192zm.734 5.956c-.347 2.277-2.09 2.277-3.776 2.277h-.96l.673-4.26a.554.554 0 0 1 .547-.468h.44c1.148 0 2.23 0 2.789.654.335.39.437.971.287 1.797z"/>
        <path fill="#003087" d="M35.29 8.47H32.24a.554.554 0 0 0-.547.468l-.14.893-.222-.323c-.688-1-2.22-1.332-3.75-1.332-3.51 0-6.51 2.66-7.094 6.39-.304 1.862.127 3.642 1.18 4.883.968 1.14 2.35 1.614 3.997 1.614 2.829 0 4.399-1.82 4.399-1.82l-.142.888a.782.782 0 0 0 .772.903h2.738c.454 0 .841-.335.913-.783l1.643-10.4a.78.78 0 0 0-.771-.78zm-4.243 6.18c-.307 1.81-1.747 3.026-3.576 3.026-.92 0-1.656-.296-2.128-.856-.47-.556-.646-1.35-.498-2.233.285-1.795 1.747-3.048 3.55-3.048.9 0 1.63.3 2.11.864.483.57.673 1.367.542 2.247z"/>
        <path fill="#009CDE" d="M67.075 2.6H60.69c-.454 0-.84.335-.913.783L57.147 19.93a.782.782 0 0 0 .772.903h3.261c.318 0 .589-.231.639-.547l.726-4.562a.923.923 0 0 1 .913-.783h2.014c4.19 0 6.607-2.028 7.238-6.045.285-1.757.012-3.136-.81-4.103-.902-1.065-2.5-1.192-4.825-1.192zm.734 5.956c-.347 2.277-2.09 2.277-3.776 2.277h-.96l.672-4.26a.554.554 0 0 1 .547-.468h.44c1.148 0 2.23 0 2.789.654.335.39.436.971.288 1.797z"/>
        <path fill="#009CDE" d="M95.354 3.03l-2.662 16.9a.782.782 0 0 0 .772.903h2.617c.454 0 .841-.335.913-.783L99.628 3.5a.782.782 0 0 0-.772-.903h-2.955a.554.554 0 0 0-.547.433z"/>
      </svg>
    ),
  },
  {
    id: 'klarna',
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
    id: 'clearpay',
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
    id: 'bank_transfer',
    label: 'Bank Transfer',
    sub: 'UK bank transfer',
    icon: <Building2 size={24} className="text-ink" />,
  },
];

// ── Stripe card form ──────────────────────────────────────────────────────────

function StripeCardFormInner({ orderId, total, onSuccess }: {
  orderId: string; total: number; onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    try {
      const res = await paymentApi.createStripeIntent(orderId);
      const { clientSecret } = res.data.data as { clientSecret: string };
      const card = elements.getElement(CardElement);
      if (!card) { toast.error('Card element not ready'); setPaying(false); return; }
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });
      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setPaying(false);
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch {
      toast.error('Payment failed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">Enter your card details below. Your payment is processed securely by Stripe.</p>
      <div className="border border-gold/20 px-3 py-3.5 bg-white">
        <CardElement options={{
          style: {
            base: { fontSize: '14px', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } },
            invalid: { color: '#dc2626' },
          },
          hidePostalCode: true,
        }} />
      </div>
      <button type="button" onClick={handlePay} disabled={!stripe || paying}
        className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60">
        <Lock size={14} />{paying ? 'Processing…' : `Pay ${formatGBP(total)}`}
      </button>
    </div>
  );
}

function StripeCardForm({ orderId, total, onSuccess }: {
  orderId: string; total: number; onSuccess: () => void;
}) {
  if (!stripePromise) {
    return (
      <div className="text-center py-6 space-y-2">
        <p className="text-sm text-ink-muted">Card payments are not yet configured.</p>
        <p className="text-xs text-ink-muted">Please choose another payment method or contact us.</p>
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <StripeCardFormInner orderId={orderId} total={total} onSuccess={onSuccess} />
    </Elements>
  );
}

// ── Apple Pay (Web Payments API) ──────────────────────────────────────────────

function ApplePayForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSupported(!!(window as any).ApplePaySession);
  }, []);

  const handleApplePay = async () => {
    setPaying(true);
    try {
      const request = new PaymentRequest(
        [{ supportedMethods: 'https://apple.com/apple-pay', data: { version: 3, merchantIdentifier: 'merchant.com.brmjewellery', merchantCapabilities: ['supports3DS'], supportedNetworks: ['visa', 'masterCard', 'amex'], countryCode: 'GB' } }],
        { total: { label: 'BRM Jewellery', amount: { currency: 'GBP', value: total.toFixed(2) } } },
      );
      const canMake = await request.canMakePayment();
      if (!canMake) { toast.error('Apple Pay is not available on this device'); setPaying(false); return; }
      const response = await request.show();
      await response.complete('success');
      onSuccess();
    } catch {
      toast.error('Apple Pay was cancelled or unavailable');
      setPaying(false);
    }
  };

  if (supported === null) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!supported) return (
    <div className="text-center py-8 text-ink-muted text-sm space-y-2">
      <p>Apple Pay is not available on this device.</p>
      <p className="text-xs">Requires Safari on macOS Monterey+ or iOS 16+ with a card added to Wallet.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">Pay with Touch ID or Face ID. Secure and instant.</p>
      <button type="button" onClick={handleApplePay} disabled={paying}
        className="w-full bg-black text-white py-3.5 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60 rounded-sm">
        {paying ? 'Processing…' : `Pay ${formatGBP(total)} with Apple Pay`}
      </button>
    </div>
  );
}

// ── Google Pay (Web Payments API) ─────────────────────────────────────────────

function GooglePayForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const [paying, setPaying] = useState(false);

  const handleGooglePay = async () => {
    setPaying(true);
    try {
      const request = new PaymentRequest(
        [{
          supportedMethods: 'https://google.com/pay',
          data: {
            environment: 'TEST',
            apiVersion: 2, apiVersionMinor: 0,
            merchantInfo: { merchantName: 'BRM Jewellery', merchantId: '01234567890123456789' },
            allowedPaymentMethods: [{
              type: 'CARD',
              parameters: { allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'], allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'] },
              tokenizationSpecification: { type: 'PAYMENT_GATEWAY', parameters: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' } },
            }],
          },
        }],
        { total: { label: 'BRM Jewellery', amount: { currency: 'GBP', value: total.toFixed(2) } } },
      );
      const canMake = await request.canMakePayment();
      if (!canMake) { toast.error('Google Pay is not available on this device'); setPaying(false); return; }
      const response = await request.show();
      await response.complete('success');
      onSuccess();
    } catch {
      toast.error('Google Pay was cancelled or unavailable');
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">Pay quickly with your saved Google Pay cards. Works on Chrome and Android.</p>
      <button type="button" onClick={handleGooglePay} disabled={paying}
        className="w-full bg-white border border-gray-300 text-gray-700 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-60 rounded-sm hover:bg-gray-50 transition-colors">
        {paying ? 'Processing…' : (
          <>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Pay {formatGBP(total)} with Google Pay
          </>
        )}
      </button>
    </div>
  );
}

// ── PayPal buttons ────────────────────────────────────────────────────────────

function PayPalForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const [{ isPending }] = usePayPalScriptReducer();
  if (isPending) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">Pay securely via your PayPal account or any card saved in PayPal.</p>
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
        onError={() => toast.error('PayPal payment failed. Please try again.')}
        onCancel={() => toast.error('PayPal payment cancelled')}
      />
    </div>
  );
}

// ── Klarna form ───────────────────────────────────────────────────────────────

function KlarnaForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await paymentApi.createKlarnaSession(orderId);
        const { clientToken } = res.data.data as { sessionId: string; clientToken: string };
        await loadScript('https://x.klarnacdn.net/kp/lib/v1/api.js', 'klarna-js');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Klarna = (window as any).Klarna;
        Klarna.Payments.init({ client_token: clientToken });
        Klarna.Payments.load(
          { container: '#klarna-payments-container', payment_method_category: 'pay_later' },
          (res: { show_form: boolean; error?: { invalid_fields: string[] } }) => {
            if (!mounted) return;
            if (res.show_form) setLoaded(true);
            else setError('Klarna is not available for this order');
          },
        );
      } catch {
        if (mounted) setError('Klarna is not available right now. Please choose another payment method.');
      }
    })();
    return () => { mounted = false; };
  }, [orderId]);

  const handleAuthorise = () => {
    setPaying(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Klarna.Payments.authorize(
      { payment_method_category: 'pay_later' },
      async (res: { approved: boolean; authorization_token?: string }) => {
        if (!res.approved || !res.authorization_token) {
          toast.error('Klarna authorisation declined');
          setPaying(false);
          return;
        }
        try {
          await paymentApi.authorizeKlarna(orderId, res.authorization_token);
          onSuccess();
        } catch {
          toast.error('Klarna payment failed');
          setPaying(false);
        }
      },
    );
  };

  if (error) return <p className="text-sm text-red-600 py-4">{error}</p>;
  if (!loaded) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div id="klarna-payments-container" />
      <button type="button" onClick={handleAuthorise} disabled={paying}
        className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest disabled:opacity-60 bg-[#FFB3C7] text-black hover:bg-[#ff9ab8] transition-colors">
        <Lock size={14} />{paying ? 'Processing…' : 'Pay with Klarna'}
      </button>
    </div>
  );
}

// ── Clearpay form ─────────────────────────────────────────────────────────────

function ClearpayForm({ orderId, total }: { orderId: string; total: number }) {
  const [loading, setLoading] = useState(false);
  const instalment = parseFloat((total / 4).toFixed(2));

  const handleClearpay = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.createClearpayCheckout(orderId);
      const { redirectCheckoutUrl } = res.data.data as { token: string; redirectCheckoutUrl: string };
      window.location.href = redirectCheckoutUrl;
    } catch {
      toast.error('Clearpay checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        Split into 4 interest-free payments of <strong>{formatGBP(instalment)}</strong>. You will be redirected to Clearpay to complete payment.
      </p>
      <button type="button" onClick={handleClearpay} disabled={loading}
        className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest disabled:opacity-60 bg-[#B2FCE4] text-black hover:bg-[#8af5d0] transition-colors">
        <Lock size={14} />{loading ? 'Redirecting to Clearpay…' : `Pay with Clearpay — ${formatGBP(instalment)} today`}
      </button>
    </div>
  );
}

// ── Bank Transfer form ────────────────────────────────────────────────────────

function BankTransferForm({ onPay, paying }: { onPay: () => void; paying: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">Your order will be reserved. Full payment instructions will be emailed to you immediately.</p>
      <div className="bg-gold/5 border border-gold/20 p-4 space-y-2">
        <p className="text-xs uppercase tracking-widest text-ink-muted font-semibold mb-3">Bank Details</p>
        {[['Account Name', 'BRM Jewellery Ltd'], ['Sort Code', '20-00-00'], ['Account Number', '12345678'], ['Reference', 'Your order number (emailed)']].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-ink-muted">{k}</span>
            <span className={`font-medium text-ink ${k === 'Sort Code' || k === 'Account Number' ? 'font-mono' : ''}`}>{v}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onPay} disabled={paying}
        className="w-full btn-gold py-3.5 flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-60">
        <Lock size={14} />{paying ? 'Processing…' : 'Place Order — Pay by Bank Transfer'}
      </button>
    </div>
  );
}

// ── Main checkout page ────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, count, clearCart } = useCart();
  const completing = useRef(false);

  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('visa');
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
    if (!authLoading && count === 0 && !completing.current) router.push('/cart');
  }, [count, authLoading, router]);

  const vatAmount = parseFloat((subtotal * VAT_RATE).toFixed(2));
  const total = parseFloat((subtotal + vatAmount).toFixed(2));

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const orderRes = await userOrderApi.create({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantId: i.variantId,
          finishName: i.finishName,
          ringWidth: i.ringWidth,
          ringProfile: i.ringProfile,
          ringWeight: i.ringWeight,
          ringSize: i.ringSize,
          engravingText: i.engravingText,
          engravingFont: i.engravingFont,
          ringFinish: i.ringFinish,
        })),
        shippingAddress: {
          line1: address.line1, line2: address.line2 || undefined,
          city: address.city, county: address.county || undefined,
          postcode: address.postcode, country: address.country,
        },
        deliveryMethod: 'STANDARD',
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
    completing.current = true;
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  }, [clearCart, router, orderId]);

  // Used only by card / bank_transfer / apple_pay / google_pay
  const handleSimplePay = useCallback(async () => {
    setPaying(true);
    try {
      await paymentApi.process(orderId, selectedMethod);
      handlePaymentSuccess();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  }, [orderId, selectedMethod, handlePaymentSuccess]);

  if (authLoading || (count === 0 && !completing.current)) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  const OrderSummary = () => (
    <div className="space-y-3 text-sm">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3">
          <div className="w-14 h-14 flex-shrink-0 bg-cream overflow-hidden">
            {item.imageUrl && <img src={resolveImageUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink line-clamp-2">{item.title}</p>
            {item.finishName ? (
              <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] uppercase tracking-widest bg-cream border border-gold/20 text-ink px-1.5 py-0.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{
                  background: item.metalType?.toUpperCase() === 'GOLD'
                    ? 'linear-gradient(135deg,#f5d97a,#C9A84C,#a8782a)'
                    : 'linear-gradient(135deg,#e8e8e8,#c8c8c8,#a0a0a0)',
                }} />
                {item.finishName}
              </span>
            ) : (item.metalType || item.carat) ? (
              <p className="text-xs text-ink-muted mt-0.5">{[item.metalType, item.carat].filter(Boolean).join(' · ')}</p>
            ) : null}
            {item.ringSize && (
              <p className="text-xs text-ink-muted mt-0.5">Size: {item.ringSize}{item.ringFinish && item.ringFinish !== 'Polished' ? ` · ${item.ringFinish}` : ''}</p>
            )}
            {item.engravingText && (
              <p className="text-xs text-ink-muted mt-0.5">Engraving: "{item.engravingText}"{item.engravingFont ? ` (${item.engravingFont})` : ''}</p>
            )}
            <p className="text-xs text-ink-muted mt-0.5">Qty {item.quantity}</p>
          </div>
          <p className="text-xs tabular-nums font-medium">{formatGBP(item.price * item.quantity)}</p>
        </div>
      ))}
      <div className="border-t border-gold/10 pt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-ink-muted"><span>Subtotal</span><span>{formatGBP(subtotal)}</span></div>
        <div className="flex justify-between text-xs text-ink-muted"><span>VAT (20%)</span><span>{formatGBP(vatAmount)}</span></div>
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

              {/* Payment method tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <button key={method.id} type="button" onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center gap-2 p-3 border transition-colors text-center ${selectedMethod === method.id ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}>
                    <div className="h-7 flex items-center justify-center">{method.icon}</div>
                    <span className="text-xs font-semibold text-ink leading-tight">{method.label}</span>
                    <span className="text-[10px] text-ink-muted leading-tight">{method.sub}</span>
                  </button>
                ))}
              </div>

              {/* Security badge */}
              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-5">
                <Lock size={11} />
                <span>
                  {CARD_METHODS.includes(selectedMethod) && 'Payments processed securely by Stripe — PCI DSS compliant'}
                  {selectedMethod === 'apple_pay' && 'Apple Pay — Touch ID / Face ID authentication'}
                  {selectedMethod === 'google_pay' && 'Google Pay — secure payment via your Google account'}
                  {selectedMethod === 'paypal' && 'PayPal — pay via your PayPal account or saved card'}
                  {selectedMethod === 'klarna' && 'Klarna — pay in 3 interest-free instalments'}
                  {selectedMethod === 'clearpay' && 'Clearpay — 4 interest-free payments, redirects to Clearpay'}
                  {selectedMethod === 'bank_transfer' && 'Bank transfer — payment instructions sent by email'}
                </span>
              </div>

              {/* ── Visa / Mastercard — Stripe Elements ── */}
              {CARD_METHODS.includes(selectedMethod) && (
                <StripeCardForm orderId={orderId} total={total} onSuccess={handlePaymentSuccess} />
              )}

              {/* ── Apple Pay ── */}
              {selectedMethod === 'apple_pay' && (
                <ApplePayForm total={total} onSuccess={handlePaymentSuccess} />
              )}

              {/* ── Google Pay ── */}
              {selectedMethod === 'google_pay' && (
                <GooglePayForm total={total} onSuccess={handlePaymentSuccess} />
              )}

              {/* ── PayPal ── */}
              {selectedMethod === 'paypal' && paypalClientId && (
                <PayPalScriptProvider options={{ clientId: paypalClientId, currency: 'GBP', intent: 'capture', components: 'buttons' }}>
                  <PayPalForm orderId={orderId} onSuccess={handlePaymentSuccess} />
                </PayPalScriptProvider>
              )}
              {selectedMethod === 'paypal' && !paypalClientId && (
                <p className="text-sm text-red-600 py-4">PayPal is not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID in your .env.</p>
              )}

              {/* ── Klarna ── */}
              {selectedMethod === 'klarna' && (
                <KlarnaForm orderId={orderId} onSuccess={handlePaymentSuccess} />
              )}

              {/* ── Clearpay ── */}
              {selectedMethod === 'clearpay' && (
                <ClearpayForm orderId={orderId} total={total} />
              )}

              {/* ── Bank Transfer ── */}
              {selectedMethod === 'bank_transfer' && (
                <BankTransferForm onPay={handleSimplePay} paying={paying} />
              )}

              <button type="button" onClick={() => setStep('address')}
                className="mt-5 text-xs text-ink-muted hover:text-gold transition-colors">
                ← Back to delivery
              </button>
            </div>
          )}
        </div>

        {/* Order summary */}
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

          {/* ── KLARNA BADGE ── */}
          <div className="mt-4" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#f9d7e0', padding: '8px 12px',
          }}>
            <img src="/assets/Klarna-logo.png" alt="Klarna" style={{ height: '46px', width: 'auto' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>
              or 3 interest-free payments of {formatGBP(parseFloat((total / 3).toFixed(2)))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
