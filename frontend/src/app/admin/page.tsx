'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Users, PoundSterling, TrendingUp, Gem, Calendar, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin.api';
import { metalPriceApi } from '@/api/metalPrice.api';
import PageHeader from '@/components/admin/PageHeader';
import StatsCard from '@/components/admin/StatsCard';
import { formatGBP } from '@/lib/formatCurrency';
import { formatRelative } from '@/lib/formatDate';
import Link from 'next/link';

interface DashboardStats {
  orders: { total: number; today: number; week: number; month: number; pending: number };
  revenue: { total: number; today: number; week: number; month: number; averageOrderValue: number };
  customers: { total: number; newThisMonth: number };
  alerts: { pendingEnquiries: number; pendingAppointments: number; lowStockProducts: number };
}

interface MetalPriceRow {
  metal: string;
  carat: string | null;
  pricePerGramGBP: number;
  fetchedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metalPrices, setMetalPrices] = useState<{ rows: MetalPriceRow[]; fetchedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getDashboardStats(), metalPriceApi.getCurrent()])
      .then(([statsRes, pricesRes]) => {
        setStats(statsRes.data.data);
        setMetalPrices(pricesRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 h-28 bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" subtitle={`Good morning — here's what's happening today`} />

      {/* Alerts */}
      {(stats.alerts.pendingEnquiries > 0 || stats.alerts.pendingAppointments > 0 || stats.alerts.lowStockProducts > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {stats.alerts.pendingEnquiries > 0 && (
            <Link href="/admin/enquiries?status=NEW" className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 text-sm text-gold hover:bg-gold/20 transition-colors">
              <AlertCircle size={14} />
              {stats.alerts.pendingEnquiries} new bespoke {stats.alerts.pendingEnquiries === 1 ? 'enquiry' : 'enquiries'}
            </Link>
          )}
          {stats.alerts.pendingAppointments > 0 && (
            <Link href="/admin/appointments?status=PENDING" className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-sm text-amber-700 hover:bg-amber-100 transition-colors">
              <Calendar size={14} />
              {stats.alerts.pendingAppointments} pending {stats.alerts.pendingAppointments === 1 ? 'appointment' : 'appointments'}
            </Link>
          )}
          {stats.alerts.lowStockProducts > 0 && (
            <Link href="/admin/products?lowStock=true" className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-sm text-danger hover:bg-red-100 transition-colors">
              <AlertCircle size={14} />
              {stats.alerts.lowStockProducts} low stock {stats.alerts.lowStockProducts === 1 ? 'product' : 'products'}
            </Link>
          )}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatGBP(stats.revenue.total)}
          subtitle={`${formatGBP(stats.revenue.month)} this month`}
          icon={PoundSterling}
        />
        <StatsCard
          title="Total Orders"
          value={stats.orders.total.toLocaleString()}
          subtitle={`${stats.orders.month} this month · ${stats.orders.pending} pending`}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Avg. Order Value"
          value={formatGBP(stats.revenue.averageOrderValue)}
          subtitle="All time"
          icon={TrendingUp}
        />
        <StatsCard
          title="Customers"
          value={stats.customers.total.toLocaleString()}
          subtitle={`${stats.customers.newThisMonth} new this month`}
          icon={Users}
        />
      </div>

      {/* Today snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-cormorant text-xl font-light text-ink mb-4">Today at a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Today's Revenue", value: formatGBP(stats.revenue.today) },
              { label: "Today's Orders", value: stats.orders.today },
              { label: 'This Week Revenue', value: formatGBP(stats.revenue.week) },
              { label: 'This Week Orders', value: stats.orders.week },
              { label: 'Pending Enquiries', value: stats.alerts.pendingEnquiries },
              { label: 'Pending Appointments', value: stats.alerts.pendingAppointments },
            ].map((item) => (
              <div key={item.label} className="border border-gray-100 p-3">
                <p className="text-xs text-ink-muted mb-1">{item.label}</p>
                <p className="font-cormorant text-xl font-light text-ink tabular-nums">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metal Prices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cormorant text-xl font-light text-ink">Live Metal Prices</h2>
            <span className="text-[10px] text-ink-muted">per gram · GBP</span>
          </div>
          {metalPrices?.rows.length ? (
            <div className="space-y-2">
              {metalPrices.rows.map((row) => (
                <div key={`${row.metal}-${row.carat}`} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-ink-muted">
                    {row.metal === 'GOLD' ? 'Gold' : row.metal === 'SILVER' ? 'Silver' : 'Platinum'}{row.carat ? ` (${row.carat})` : ''}
                  </span>
                  <span className="text-sm font-medium text-ink tabular-nums">
                    {formatGBP(Number(row.pricePerGramGBP))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Prices unavailable</p>
          )}
          {metalPrices?.fetchedAt && (
            <p className="text-[10px] text-ink-muted mt-3">Updated {formatRelative(metalPrices.fetchedAt)}</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="card p-6">
        <h2 className="font-cormorant text-xl font-light text-ink mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="btn-gold text-xs py-2 px-5">Add Product</Link>
          <Link href="/admin/categories/new" className="btn-outline-gold text-xs py-2 px-5">Add Category</Link>
          <Link href="/admin/orders" className="btn-outline-gold text-xs py-2 px-5">View Orders</Link>
          <Link href="/admin/enquiries" className="btn-outline-gold text-xs py-2 px-5">Bespoke Enquiries</Link>
          <Link href="/admin/reports" className="btn-outline-gold text-xs py-2 px-5">Reports</Link>
        </div>
      </div>
    </div>
  );
}
