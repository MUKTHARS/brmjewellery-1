import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Sign In | BRM Jewellery' };

// No separate AuthProvider here — the admin layout's AuthProvider covers the
// entire /admin/* tree including /admin/login. Using a second instance caused
// a redirect loop: the outer provider (user=null) kept sending the user back
// to /admin/login after the inner provider completed login.
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
