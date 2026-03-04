'use client';

import { useState } from 'react';
import { CheckCircle2, CalendarDays, Clock, MapPin } from 'lucide-react';
import { appointmentApi } from '@/api/appointment.api';
import toast from 'react-hot-toast';

const APPOINTMENT_TYPES = [
  { value: 'CONSULTATION', label: 'Jewellery Consultation', desc: 'Discuss your needs with our experts' },
  { value: 'VIEWING', label: 'Private Viewing', desc: 'Browse our collections in person' },
  { value: 'BESPOKE_DISCUSSION', label: 'Bespoke Design Session', desc: 'Plan your custom piece' },
  { value: 'RING_SIZING', label: 'Ring Sizing', desc: 'Find your perfect fit' },
  { value: 'COLLECTION', label: 'Collect Order', desc: 'Pick up your completed piece' },
];

const TIME_SLOTS = ['10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: '', message: '' });
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) { toast.error('Please select an appointment type'); return; }
    if (!form.time) { toast.error('Please select a time slot'); return; }
    setLoading(true);
    try {
      await appointmentApi.create({
        name: form.name, email: form.email, phone: form.phone,
        appointmentType: selectedType,
        preferredDate: form.date,
        preferredTime: form.time,
        message: form.message || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <CheckCircle2 size={48} className="text-success mx-auto mb-5" />
      <h1 className="font-cormorant text-4xl font-light text-ink mb-3">Appointment Requested</h1>
      <p className="text-ink-muted leading-relaxed">We'll confirm your appointment within 24 hours. A confirmation will be sent to {form.email}.</p>
      <div className="mt-8 border border-gold/10 p-5 text-left text-sm space-y-2">
        <div className="flex gap-2"><CalendarDays size={14} className="text-gold mt-0.5" /><span>{new Date(form.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at {form.time}</span></div>
        <div className="flex gap-2"><Clock size={14} className="text-gold mt-0.5" /><span>{APPOINTMENT_TYPES.find((t) => t.value === selectedType)?.label}</span></div>
        <div className="flex gap-2"><MapPin size={14} className="text-gold mt-0.5" /><span>BRM Jewellery, London (address in confirmation email)</span></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-gold text-xs uppercase tracking-widest mb-3">Private Appointments</p>
        <h1 className="font-cormorant text-5xl font-light text-ink mb-4">Book an Appointment</h1>
        <div className="w-16 h-px bg-gold mx-auto mb-4" />
        <p className="text-ink-muted max-w-md mx-auto leading-relaxed">
          Visit us in our London showroom for a personal, unhurried experience with our jewellery experts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Appointment Type */}
        <div className="border border-gold/10 p-6">
          <h2 className="text-xs uppercase tracking-widest text-ink mb-4">Type of Appointment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APPOINTMENT_TYPES.map((t) => (
              <label key={t.value} className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${selectedType === t.value ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}>
                <input type="radio" name="type" value={t.value} checked={selectedType === t.value} onChange={() => setSelectedType(t.value)} className="mt-0.5 text-gold" />
                <div>
                  <p className="text-sm font-medium text-ink">{t.label}</p>
                  <p className="text-xs text-ink-muted">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="border border-gold/10 p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-ink">Date & Time</h2>
          <div>
            <label className="label-base">Preferred Date</label>
            <input type="date" required value={form.date} onChange={setF('date')} min={minDateStr} className="input-base" />
          </div>
          <div>
            <label className="label-base">Preferred Time</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {TIME_SLOTS.map((t) => (
                <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, time: t }))}
                  className={`py-2 text-xs border transition-colors ${form.time === t ? 'bg-gold text-white border-gold' : 'border-gold/20 text-ink-muted hover:border-gold hover:text-ink'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="border border-gold/10 p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-ink">Your Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label-base">Full Name</label><input required value={form.name} onChange={setF('name')} className="input-base" /></div>
            <div><label className="label-base">Email</label><input type="email" required value={form.email} onChange={setF('email')} className="input-base" /></div>
            <div className="sm:col-span-2"><label className="label-base">Phone</label><input type="tel" required value={form.phone} onChange={setF('phone')} className="input-base" /></div>
          </div>
          <div>
            <label className="label-base">Message <span className="text-ink-muted font-normal">(optional)</span></label>
            <textarea rows={3} value={form.message} onChange={setF('message')} className="input-base resize-none" placeholder="Anything you'd like us to prepare…" />
          </div>
        </div>

        <button type="submit" disabled={loading || !selectedType || !form.date || !form.time}
          className="w-full btn-gold py-4 text-sm uppercase tracking-widest disabled:opacity-60">
          {loading ? 'Booking…' : 'Request Appointment'}
        </button>
        <p className="text-xs text-ink-muted text-center">Appointments are subject to availability. We'll confirm by email within 24 hours.</p>
      </form>
    </div>
  );
}
