'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentApi } from '@/api/payment.api';
import { useCart } from '@/contexts/CartContext';

function ClearpayReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [message, setMessage] = useState('Confirming your Clearpay payment…');

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const orderToken = searchParams.get('orderToken');
    const status = searchParams.get('status');

    if (!orderId || !orderToken || !status) {
      router.replace('/checkout');
      return;
    }

    if (status !== 'SUCCESS') {
      setMessage('Payment cancelled. Redirecting…');
      setTimeout(() => router.replace('/checkout'), 2000);
      return;
    }

    paymentApi
      .confirmClearpay(orderId, orderToken, status)
      .then(() => {
        clearCart();
        router.replace(`/checkout/success?orderId=${orderId}`);
      })
      .catch(() => {
        setMessage('Clearpay confirmation failed. Please contact support.');
        setTimeout(() => router.replace('/checkout'), 3000);
      });
  }, [searchParams, router, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <div className="w-8 h-8 border-2 border-[#B2FCE4] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}

export default function ClearpayReturnPageWrapper() {
  return <Suspense fallback={null}><ClearpayReturnPage /></Suspense>;
}
