'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { bespokeApi } from '@/api/bespoke.api';
import PageHeader from '@/components/admin/PageHeader';
import Badge, { getBespokeStatusVariant } from '@/components/admin/Badge';
import { formatUKDate } from '@/lib/formatDate';
import { formatGBP } from '@/lib/formatCurrency';
import toast from 'react-hot-toast';

interface EnquiryDetail {
  id: string; name: string; email: string; phone?: string;
  metalType: string; carat: string; description: string;
  budgetGBP?: number; status: string; createdAt: string;
  adminNotes?: string; quotedPriceGBP?: number;
  referenceImages: string[];
  preferredDate?: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
}

const STATUSES = ['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function EnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<EnquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    bespokeApi.getById(id).then(({ data }) => {
      setEnquiry(data.data);
      setStatus(data.data.status);
      setAdminNotes(data.data.adminNotes ?? '');
      setQuotedPrice(data.data.quotedPriceGBP ? String(data.data.quotedPriceGBP) : '');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await bespokeApi.updateStatus(id, {
        status,
        adminNotes: adminNotes || undefined,
        quotedPriceGBP: quotedPrice ? parseFloat(quotedPrice) : undefined,
      });
      toast.success('Enquiry updated');
      setEnquiry((prev) => prev ? { ...prev, status, adminNotes, quotedPriceGBP: quotedPrice ? parseFloat(quotedPrice) : prev.quotedPriceGBP } : prev);
    } catch { toast.error('Failed to update enquiry'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!enquiry) return <div className="p-8"><p className="text-ink-muted">Enquiry not found.</p></div>;

  return (
    <div className="p-8 max-w-5xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Enquiries
      </button>

      <PageHeader
        title={`Enquiry — ${enquiry.name}`}
        subtitle={`Received ${formatUKDate(enquiry.createdAt)}`}
        action={
          <div className="flex items-center gap-3">
            <Badge label={enquiry.status} variant={getBespokeStatusVariant(enquiry.status)} />
            <button onClick={handleSave} disabled={saving} className="btn-gold h-9 px-5 text-sm">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Enquiry Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-ink">Enquiry Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-ink-muted mb-0.5">Name</p><p>{enquiry.name}</p></div>
              <div><p className="text-xs text-ink-muted mb-0.5">Email</p><p>{enquiry.email}</p></div>
              <div><p className="text-xs text-ink-muted mb-0.5">Phone</p><p>{enquiry.phone || '—'}</p></div>
              <div><p className="text-xs text-ink-muted mb-0.5">Preferred Date</p><p>{enquiry.preferredDate ? formatUKDate(enquiry.preferredDate) : '—'}</p></div>
              <div><p className="text-xs text-ink-muted mb-0.5">Metal Type</p><p>{enquiry.metalType}</p></div>
              <div><p className="text-xs text-ink-muted mb-0.5">Carat</p><p>{enquiry.carat}</p></div>
              <div><p className="text-xs text-ink-muted mb-0.5">Budget</p><p className="tabular-nums">{enquiry.budgetGBP ? formatGBP(enquiry.budgetGBP) : '—'}</p></div>
              {enquiry.user && (
                <div>
                  <p className="text-xs text-ink-muted mb-0.5">Linked Account</p>
                  <button onClick={() => router.push(`/admin/customers/${enquiry.user!.id}`)} className="text-gold hover:underline text-sm">
                    {enquiry.user.firstName} {enquiry.user.lastName}
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-ink-muted mb-1">Description</p>
              <p className="text-sm text-ink leading-relaxed bg-cream rounded p-3">{enquiry.description}</p>
            </div>
          </div>

          {/* Reference Images */}
          {enquiry.referenceImages.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-ink mb-4">Reference Images</h3>
              <div className="grid grid-cols-3 gap-3">
                {enquiry.referenceImages.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(url)}
                    className="aspect-square rounded overflow-hidden border border-gold/20 hover:border-gold transition-colors group relative">
                    <img src={url} alt={`Reference ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors flex items-center justify-center">
                      <ImageIcon size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Admin Actions */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-ink">Update Status</h3>
            <div>
              <label className="label-base mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base w-full h-9 text-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base mb-1.5">Quoted Price (£)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00"
                value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)}
                className="input-base w-full h-9 text-sm" />
              {enquiry.quotedPriceGBP && (
                <p className="text-xs text-ink-muted mt-1">Current: {formatGBP(enquiry.quotedPriceGBP)}</p>
              )}
            </div>
            <div>
              <label className="label-base mb-1.5">Admin Notes</label>
              <textarea rows={5} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes visible only to admins…"
                className="input-base w-full text-sm resize-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Reference" className="max-w-3xl max-h-[90vh] object-contain rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
