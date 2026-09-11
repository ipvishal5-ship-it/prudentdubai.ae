'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: data.get('password') }),
    });
    const result = (await response.json()) as { error?: string };
    if (response.ok) window.location.reload();
    else setError(result.error || 'Unable to sign in.');
    setBusy(false);
  }

  return (
    <main className="admin-shell">
      <form className="admin-panel admin-login-panel" onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <Image src="/brand/smalllogo.png" alt="Prudent" width={42} height={29} />
          <span className="eyebrow" style={{ margin: 0 }}>Private workspace</span>
        </div>
        <h1>Prudent Content Studio</h1>
        <p>Manage verified property opportunities and editorial guides.</p>
        <label className="field-label" htmlFor="admin-password">Password</label>
        <input className="field-input" id="admin-password" name="password" type="password" required autoComplete="current-password" />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
