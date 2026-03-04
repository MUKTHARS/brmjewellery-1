import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
