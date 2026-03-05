'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { login, user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in as admin — go to dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) router.replace('/admin');
  }, [user, loading, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      // AuthContext sets user; the useEffect above will redirect if admin
      // If not admin, show error
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // After login, check role
  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error('Access denied — admin account required');
      localStorage.removeItem('accessToken');
      router.replace('/admin/login');
    }
  }, [user, loading, isAdmin, router]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-cormorant text-4xl font-light tracking-[0.3em] text-ink">BRM</h1>
          <p className="text-xs text-ink-muted tracking-[0.2em] uppercase mt-1">Jewellery · Admin</p>
          <div className="w-16 h-px bg-gold mx-auto mt-4" />
        </div>

        <div className="bg-white border border-gray-100 shadow-card p-8">
          <h2 className="font-cormorant text-2xl font-light text-ink mb-6">Admin Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-base">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="admin@brmjewellery.co.uk"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label-base">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">BRM Jewellery · Admin Portal</p>
      </div>
    </div>
  );
}
