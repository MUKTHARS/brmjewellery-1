'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/admin/Sidebar';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Don't redirect when already on the login page — that creates a blank-page loop
    if (!loading && (!user || !isAdmin) && !isLoginPage) {
      router.replace('/admin/login');
    }
  }, [user, loading, isAdmin, router, isLoginPage]);

  // Login page bypasses the guard entirely — it manages its own auth state
  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <p className="font-cormorant text-2xl tracking-widest text-ink animate-pulse">BRM</p>
          <p className="text-xs text-ink-muted mt-2 tracking-widest">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Didact Gothic, sans-serif', fontSize: '13px', borderRadius: '2px' },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
