import { adminIsConfigured, isAdminAuthenticated } from '@/lib/auth';
import AdminLogin from './AdminLogin';
import AdminStudio from './AdminStudio';

export const metadata = { title: 'Content Studio', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!adminIsConfigured()) {
    return (
      <main className="admin-shell">
        <section className="admin-panel admin-login-panel">
          <span className="eyebrow">Content Studio</span>
          <h1>Admin access is disabled</h1>
          <p>Set <code>ADMIN_PASSWORD</code> and a random <code>ADMIN_SESSION_SECRET</code> of at least 32 characters on the server, then restart the application.</p>
        </section>
      </main>
    );
  }
  if (!(await isAdminAuthenticated())) return <AdminLogin />;
  return <AdminStudio />;
}
