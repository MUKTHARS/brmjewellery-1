'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, ShoppingBag, LogOut } from 'lucide-react';

const ACCOUNT_LINKS = [
  { href: '/account', label: 'My Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: ShoppingBag },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/account');
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-gold text-xs uppercase tracking-widest mb-1">Welcome back</p>
        <h1 className="font-cormorant text-4xl font-light text-ink">{user.firstName} {user.lastName}</h1>
        <div className="w-16 h-px bg-gold mt-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <nav className="space-y-1">
            {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${pathname === href ? 'text-gold bg-gold/5 font-medium' : 'text-ink-muted hover:text-ink hover:bg-cream'}`}>
                <Icon size={15} /> {label}
              </Link>
            ))}
            <button onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-muted hover:text-danger w-full text-left transition-colors">
              <LogOut size={15} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
