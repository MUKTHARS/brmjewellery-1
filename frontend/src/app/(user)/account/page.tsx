'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/api/user.api';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: '' });
  const setF = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await userApi.update(user.id, { firstName: form.firstName, lastName: form.lastName });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Profile */}
      <div className="border border-gold/10 p-6">
        <h2 className="text-xs uppercase tracking-widest text-ink mb-5">Profile Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label-base">First Name</label><input value={form.firstName} onChange={setF('firstName')} required className="input-base" /></div>
            <div><label className="label-base">Last Name</label><input value={form.lastName} onChange={setF('lastName')} required className="input-base" /></div>
          </div>
          <div>
            <label className="label-base">Email Address</label>
            <input value={user.email} disabled className="input-base bg-cream cursor-not-allowed opacity-60" />
            <p className="text-xs text-ink-muted mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={saving} className="btn-gold h-9 px-6 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="border border-gold/10 p-6">
        <h2 className="text-xs uppercase tracking-widest text-ink mb-4">Account Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-ink-muted mb-0.5">Account Type</p><p className="text-ink font-medium capitalize">{user.role.toLowerCase()}</p></div>
          <div><p className="text-xs text-ink-muted mb-0.5">Member Since</p><p className="text-ink">BRM Jewellery Member</p></div>
        </div>
      </div>
    </div>
  );
}
