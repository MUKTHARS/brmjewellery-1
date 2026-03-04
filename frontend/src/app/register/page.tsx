'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth.api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone || undefined, password: form.password });
      await login(form.email, form.password);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/"><h1 className="font-cormorant text-4xl font-light tracking-[0.3em] text-ink">BRM</h1></Link>
          <p className="text-xs text-ink-muted tracking-[0.2em] uppercase mt-1">Create Account</p>
          <div className="w-16 h-px bg-gold mx-auto mt-4" />
        </div>

        <div className="bg-white border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">First Name</label>
                <input type="text" value={form.firstName} onChange={set('firstName')} required className="input-base" placeholder="Jane" />
              </div>
              <div>
                <label className="label-base">Last Name</label>
                <input type="text" value={form.lastName} onChange={set('lastName')} required className="input-base" placeholder="Smith" />
              </div>
            </div>
            <div>
              <label className="label-base">Email Address</label>
              <input type="email" value={form.email} onChange={set('email')} required className="input-base" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="label-base">Phone <span className="text-ink-muted font-normal">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} className="input-base" placeholder="+44 7700 900000" />
            </div>
            <div>
              <label className="label-base">Password</label>
              <input type="password" value={form.password} onChange={set('password')} required minLength={8} className="input-base" placeholder="Min. 8 characters" />
            </div>
            <div>
              <label className="label-base">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required className="input-base" placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-gold mt-2 disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-muted mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-gold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
