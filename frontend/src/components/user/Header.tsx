'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Menu, X, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const NAV_LINKS = [
  { href: '/products', label: 'Collections' },
  { href: '/bespoke', label: 'Bespoke' },
  { href: '/appointments', label: 'Appointments' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center group">
            <span className="font-cormorant text-2xl font-light tracking-[0.3em] text-ink group-hover:text-gold transition-colors">BRM</span>
            <span className="text-[9px] text-ink-muted tracking-[0.2em] uppercase -mt-1">Jewellery</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}
                className={`text-sm tracking-wider uppercase transition-colors ${pathname.startsWith(link.href) ? 'text-gold' : 'text-ink-muted hover:text-ink'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Account */}
            {user ? (
              <div className="relative hidden md:block">
                <button onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                  <User size={16} />
                  <span className="max-w-24 truncate">{user.firstName}</span>
                  <ChevronDown size={12} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-8 w-44 bg-white border border-gold/10 shadow-sm rounded py-1 z-50"
                    onBlur={() => setAccountOpen(false)}>
                    <Link href="/account" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink hover:bg-cream transition-colors">My Account</Link>
                    <Link href="/account/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-ink hover:bg-cream transition-colors">My Orders</Link>
                    {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                      <Link href="/admin" onClick={() => setAccountOpen(false)} className="block px-4 py-2 text-sm text-gold hover:bg-cream transition-colors">Admin Panel</Link>
                    )}
                    <hr className="my-1 border-gold/10" />
                    <button onClick={() => { setAccountOpen(false); logout(); }} className="block w-full text-left px-4 py-2 text-sm text-ink-muted hover:bg-cream transition-colors">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-1">
              <ShoppingBag size={20} className="text-ink hover:text-gold transition-colors" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1 text-ink">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/10 bg-white px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className="block text-sm uppercase tracking-wider text-ink-muted hover:text-gold transition-colors py-1">
              {link.label}
            </Link>
          ))}
          <hr className="border-gold/10" />
          {user ? (
            <>
              <Link href="/account" onClick={() => setMobileOpen(false)} className="block text-sm text-ink py-1">My Account</Link>
              <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="block text-sm text-ink py-1">My Orders</Link>
              <button onClick={() => { setMobileOpen(false); logout(); }} className="block text-sm text-ink-muted py-1">Sign Out</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-sm text-ink py-1">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}
