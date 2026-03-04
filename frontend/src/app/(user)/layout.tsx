import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: { default: 'BRM Jewellery', template: '%s | BRM Jewellery' },
  description: 'Luxury handcrafted jewellery — London, UK',
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-didact)', fontSize: '13px' } }} />
      </CartProvider>
    </AuthProvider>
  );
}
