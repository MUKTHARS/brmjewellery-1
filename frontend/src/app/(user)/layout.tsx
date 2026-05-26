import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/user/Header';
import TopBanner from '@/components/user/TopBanner';
import Footer from '@/components/user/Footer';
import LiveChat from '@/components/user/LiveChat';
import EntryPopup from '@/components/user/EntryPopup';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'BRM Jewellery', template: '%s | BRM Jewellery' },
  description: 'Luxury handcrafted jewellery — London, UK',
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <TopBanner />
        <Suspense fallback={null}><Header /></Suspense>
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Suspense fallback={null}><LiveChat /></Suspense>
        <Suspense fallback={null}><EntryPopup /></Suspense>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-didact)', fontSize: '13px' } }} />
      </CartProvider>
    </AuthProvider>
  );
}
