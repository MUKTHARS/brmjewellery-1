'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { bespokeApi } from '@/api/bespoke.api';
import toast from 'react-hot-toast';

const METAL_TYPES = ['GOLD', 'SILVER', 'PLATINUM'];
const CARATS = ['9k', '14k', '18k', '22k', '24k', '925 Silver', '950 Platinum'];

export default function BespokePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', metalType: 'GOLD', carat: '18k', description: '', budgetGBP: '', preferredDate: '' });
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 5, maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      files.forEach((f) => fd.append('images', f));
      await bespokeApi.create(fd as unknown as Parameters<typeof bespokeApi.create>[0]);
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Submission failed');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <CheckCircle2 size={48} className="text-success mx-auto mb-5" />
      <h1 className="font-cormorant text-4xl font-light text-ink mb-3">Enquiry Received</h1>
      <p className="text-ink-muted leading-relaxed">Thank you for your bespoke enquiry. Our master craftspeople will review your brief and be in touch within 2 working days.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">Custom Creations</p>
        <h1 className="font-cormorant text-5xl font-light text-ink mb-4">Bespoke Jewellery</h1>
        <div className="w-16 h-px bg-gold mx-auto mb-4" />
        <p className="text-ink-muted max-w-lg mx-auto leading-relaxed">
          Commission a one-of-a-kind piece crafted to your exact vision. Tell us your dream and our master goldsmiths will bring it to life.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact */}
        <div className="border border-gold/10 p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-ink mb-1">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-base">Full Name</label><input required value={form.name} onChange={setF('name')} className="input-base" placeholder="Jane Smith" /></div>
            <div><label className="label-base">Email</label><input type="email" required value={form.email} onChange={setF('email')} className="input-base" placeholder="jane@example.com" /></div>
            <div><label className="label-base">Phone</label><input type="tel" required value={form.phone} onChange={setF('phone')} className="input-base" placeholder="+44 7700 900000" /></div>
            <div><label className="label-base">Preferred Contact Date <span className="text-ink-muted font-normal">(optional)</span></label>
              <input type="date" value={form.preferredDate} onChange={setF('preferredDate')} className="input-base" min={new Date().toISOString().split('T')[0]} /></div>
          </div>
        </div>

        {/* Piece Specification */}
        <div className="border border-gold/10 p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-ink mb-1">Your Vision</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-base">Metal Type</label>
              <select value={form.metalType} onChange={setF('metalType')} className="input-base w-full">
                {METAL_TYPES.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="label-base">Purity / Carat</label>
              <select value={form.carat} onChange={setF('carat')} className="input-base w-full">
                {CARATS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-base">Approximate Budget (£)</label>
            <input type="number" min="100" step="50" value={form.budgetGBP} onChange={setF('budgetGBP')} className="input-base" placeholder="e.g. 1500" />
          </div>
          <div>
            <label className="label-base">Describe Your Piece <span className="text-danger">*</span></label>
            <textarea required rows={6} value={form.description} onChange={setF('description')} className="input-base resize-none"
              placeholder="Tell us about the piece you have in mind — style, occasion, any stones, engravings, special meaning…" />
          </div>
        </div>

        {/* Reference Images */}
        <div className="border border-gold/10 p-6">
          <h2 className="text-xs uppercase tracking-widest text-ink mb-3">Reference Images <span className="text-ink-muted font-normal normal-case">(up to 5)</span></h2>
          <div {...getRootProps()} className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-gold bg-gold/5' : 'border-gold/20 hover:border-gold/50'}`}>
            <input {...getInputProps()} />
            <Upload size={24} className="text-gold/40 mx-auto mb-2" />
            <p className="text-sm text-ink-muted">{isDragActive ? 'Drop here…' : 'Drag & drop images, or click to browse'}</p>
            <p className="text-xs text-ink-muted/60 mt-1">PNG, JPG up to 10MB · Max 5 files</p>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded" />
                  <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white rounded-full flex items-center justify-center">
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full btn-gold py-4 text-sm uppercase tracking-widest disabled:opacity-60">
          {loading ? 'Submitting…' : 'Submit Bespoke Enquiry'}
        </button>
        <p className="text-xs text-ink-muted text-center">We typically respond within 2 working days. No obligation.</p>
      </form>
    </div>
  );
}
