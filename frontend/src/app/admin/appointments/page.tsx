'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CalendarDays } from 'lucide-react';
import { appointmentApi } from '@/api/appointment.api';
import PageHeader from '@/components/admin/PageHeader';
import DataTable from '@/components/admin/DataTable';
import Pagination from '@/components/admin/Pagination';
import Badge, { getAppointmentStatusVariant } from '@/components/admin/Badge';
import { formatUKDate } from '@/lib/formatDate';
import toast from 'react-hot-toast';

interface Appointment {
  id: string; name: string; email: string; phone?: string;
  appointmentType: string; preferredDate: string; preferredTime?: string;
  message?: string; status: string; createdAt: string;
  user?: { firstName: string; lastName: string };
}

const STATUS_OPTIONS = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const TYPE_OPTIONS = ['', 'CONSULTATION', 'VIEWING', 'BESPOKE_DISCUSSION', 'RING_SIZING', 'COLLECTION'];

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await appointmentApi.getAll({
        page, limit: 25,
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      setAppointments(data.data);
      setTotalPages(data.meta?.totalPages ?? 1);
    } finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleStatusChange = async (id: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await appointmentApi.update(id, { status: newStatus });
      toast.success('Status updated');
      fetchAppointments();
    } catch { toast.error('Failed to update status'); }
  };

  const columns = [
    { key: 'name', header: 'Customer', render: (row: Appointment) => (
      <div>
        <p className="text-sm font-medium text-ink">{row.name}</p>
        <p className="text-xs text-ink-muted">{row.email}</p>
      </div>
    )},
    { key: 'appointmentType', header: 'Type', render: (row: Appointment) => (
      <span className="text-xs text-ink capitalize">{row.appointmentType.replace(/_/g, ' ')}</span>
    )},
    { key: 'preferredDate', header: 'Date & Time', render: (row: Appointment) => (
      <div>
        <p className="text-sm font-medium flex items-center gap-1">
          <CalendarDays size={12} className="text-gold" />
          {formatUKDate(row.preferredDate)}
        </p>
        {row.preferredTime && <p className="text-xs text-ink-muted">{row.preferredTime}</p>}
      </div>
    )},
    { key: 'status', header: 'Status', render: (row: Appointment) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row.id, e.target.value, e as unknown as React.MouseEvent)}
          className="input-base h-7 text-xs w-32"
          onClick={(e) => e.stopPropagation()}
        >
          {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    )},
    { key: 'createdAt', header: 'Booked', render: (row: Appointment) => <span className="text-xs text-ink-muted">{formatUKDate(row.createdAt)}</span> },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Appointments" subtitle="Manage in-store and virtual appointments" />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input type="text" placeholder="Search appointments…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base pl-8 h-9 text-xs" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-base w-36 h-9 text-xs">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-base w-44 h-9 text-xs">
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t ? t.replace(/_/g, ' ') : 'All Types'}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={appointments as unknown as Record<string, unknown>[]}
        keyField="id" loading={loading}
        emptyMessage="No appointments found"
        onRowClick={(row) => {
          const apt = row as unknown as Appointment;
          toast((t) => (
            <div className="text-sm">
              <p className="font-semibold mb-1">{apt.name}</p>
              <p className="text-ink-muted">{apt.message || 'No message'}</p>
              <button onClick={() => toast.dismiss(t.id)} className="mt-2 text-gold text-xs underline">Close</button>
            </div>
          ), { duration: 8000 });
        }}
      />
      <div className="flex justify-between items-center mt-4">
        <p className="text-xs text-ink-muted">{appointments.length} appointments shown</p>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
