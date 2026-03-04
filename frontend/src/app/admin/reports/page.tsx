'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminApi } from '@/api/admin.api';
import PageHeader from '@/components/admin/PageHeader';
import { formatGBP } from '@/lib/formatCurrency';

interface SalesReport {
  period: string; revenue: number; orders: number; avgOrderValue: number;
}
interface MarginReport {
  product: string; sku: string; revenue: number; baseCost: number; margin: number; marginPct: number;
}
interface CategoryRevenue {
  category: string; revenue: number; orders: number;
}

const GOLD_PALETTE = ['#C9A84C', '#DFC070', '#B08C38', '#8B6E28', '#E8D090'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gold/20 rounded p-3 shadow-sm text-xs">
      <p className="font-semibold text-ink mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.name === 'revenue' ? '#C9A84C' : '#1A1A1A' }}>
          {p.name === 'revenue' || p.name === 'margin' ? formatGBP(p.value) : p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [marginData, setMarginData] = useState<MarginReport[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '365d'>('30d');
  const [activeTab, setActiveTab] = useState<'sales' | 'margin' | 'category'>('sales');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [salesRes, marginRes, catRes] = await Promise.all([
          adminApi.getSalesReport({ period }),
          adminApi.getMarginReport({ period }),
          adminApi.getRevenueByCategory({ period }),
        ]);
        setSalesData(salesRes.data.data ?? []);
        setMarginData(marginRes.data.data ?? []);
        setCategoryData(catRes.data.data ?? []);
      } finally { setLoading(false); }
    };
    load();
  }, [period]);

  const totalRevenue = salesData.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = salesData.reduce((s, r) => s + r.orders, 0);
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const avgMargin = marginData.length > 0 ? marginData.reduce((s, r) => s + r.marginPct, 0) / marginData.length : 0;

  const PERIODS = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '365d', label: '12 Months' },
  ] as const;

  const TABS = [
    { key: 'sales', label: 'Sales Over Time' },
    { key: 'margin', label: 'Product Margins' },
    { key: 'category', label: 'Revenue by Category' },
  ] as const;

  return (
    <div className="p-8">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business performance and financial insights"
        action={
          <div className="flex gap-1 bg-cream rounded p-1">
            {PERIODS.map((p) => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${period === p.value ? 'bg-gold text-white' : 'text-ink-muted hover:text-ink'}`}>
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatGBP(totalRevenue) },
          { label: 'Total Orders', value: totalOrders.toLocaleString() },
          { label: 'Avg Order Value', value: formatGBP(avgOrder) },
          { label: 'Avg Margin', value: `${avgMargin.toFixed(1)}%` },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <p className="text-xs text-ink-muted uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-cormorant font-semibold text-ink">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gold/20 mb-6">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === t.key ? 'text-gold border-gold' : 'text-ink-muted border-transparent hover:text-ink'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-80 bg-cream rounded animate-pulse" />
      ) : (
        <>
          {/* Sales Chart */}
          {activeTab === 'sales' && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink mb-6">Revenue & Orders</h3>
              {salesData.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-16">No data for selected period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E3D9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6B6B6B' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6B6B6B' }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6B6B6B' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} name="revenue" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#1A1A1A" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Margin Chart */}
          {activeTab === 'margin' && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink mb-6">Product Margins (Top 15)</h3>
              {marginData.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-16">No data for selected period.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={marginData.slice(0, 15)} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E3D9" vertical={false} />
                      <XAxis dataKey="sku" tick={{ fontSize: 10, fill: '#6B6B6B' }} angle={-45} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B6B6B' }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="marginPct" fill="#C9A84C" radius={[2, 2, 0, 0]} name="margin" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gold/10">
                          <th className="table-th text-left">Product</th>
                          <th className="table-th text-right">Revenue</th>
                          <th className="table-th text-right">Base Cost</th>
                          <th className="table-th text-right">Margin</th>
                          <th className="table-th text-right">Margin %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marginData.map((row) => (
                          <tr key={row.sku} className="border-b border-gold/5 hover:bg-cream/50">
                            <td className="table-td">
                              <p className="font-medium text-ink line-clamp-1">{row.product}</p>
                              <p className="text-xs text-ink-muted">{row.sku}</p>
                            </td>
                            <td className="table-td text-right tabular-nums">{formatGBP(row.revenue)}</td>
                            <td className="table-td text-right tabular-nums text-ink-muted">{formatGBP(row.baseCost)}</td>
                            <td className="table-td text-right tabular-nums">{formatGBP(row.margin)}</td>
                            <td className={`table-td text-right tabular-nums font-semibold ${row.marginPct >= 30 ? 'text-success' : row.marginPct >= 15 ? 'text-gold' : 'text-danger'}`}>
                              {row.marginPct.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Category Chart */}
          {activeTab === 'category' && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink mb-6">Revenue by Category</h3>
              {categoryData.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-16">No data for selected period.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={categoryData} dataKey="revenue" nameKey="category" cx="50%" cy="50%"
                        outerRadius={110} innerRadius={55} paddingAngle={2}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={GOLD_PALETTE[i % GOLD_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatGBP(v)} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {categoryData.map((row, i) => (
                      <div key={row.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: GOLD_PALETTE[i % GOLD_PALETTE.length] }} />
                          <span className="text-sm text-ink">{row.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold tabular-nums">{formatGBP(row.revenue)}</p>
                          <p className="text-xs text-ink-muted">{row.orders} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
