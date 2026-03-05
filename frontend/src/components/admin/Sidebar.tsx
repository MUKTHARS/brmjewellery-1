'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  Gem, Calendar, BarChart2, Star, Bell, Mail, LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Bespoke Enquiries', href: '/admin/enquiries', icon: Gem },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Bell },
  { label: 'Contact Messages', href: '/admin/contact', icon: Mail },
  { label: 'Reports', href: '/admin/reports', icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-100">
        <Link href="/admin" className="block">
          <p className="font-cormorant text-2xl font-light tracking-[0.3em] text-ink">BRM</p>
          <p className="text-[10px] text-ink-muted tracking-[0.2em] uppercase mt-0.5">Admin Portal</p>
        </Link>
        <div className="w-8 h-px bg-gold mt-3" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  active ? 'nav-link-active' : 'nav-link',
                  'group'
                )}
              >
                <item.icon size={16} className={cn(active ? 'text-gold' : 'text-ink-light group-hover:text-ink')} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={12} className="text-gold" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 bg-gold/10 border border-gold/30 flex items-center justify-center">
            <span className="text-xs font-medium text-gold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-ink-muted truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout('/admin/login')}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-ink-muted hover:text-danger transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
