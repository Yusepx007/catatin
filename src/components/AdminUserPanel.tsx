'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type AdminUser = {
  user_id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
};

type CreateUserResponse = {
  success?: boolean;
  error?: string;
  user?: AdminUser;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Sesi tidak valid. Silakan masuk kembali.');

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export default function AdminUserPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = useCallback(async (): Promise<AdminUser[]> => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/users', { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat user.');
    return data.users || [];
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initUsers() {
      try {
        const loadedUsers = await loadUsers();
        if (!cancelled) setUsers(loadedUsers);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat user.');
      }
    }

    void initUsers();

    return () => {
      cancelled = true;
    };
  }, [loadUsers]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, role }),
      });
      const data = (await res.json()) as CreateUserResponse;

      if (!res.ok) throw new Error(data.error || 'Gagal membuat user.');

      setMessage(`User ${email} berhasil dibuat sebagai ${role}.`);
      setEmail('');
      setPassword('');
      setRole('user');
      setUsers(await loadUsers());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal membuat user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="surface-card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <p className="section-label" style={{ marginBottom: 10 }}>Admin</p>
        <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Tambah user
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
          Buat akun baru tanpa membuka pendaftaran publik.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }} noValidate>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email@domain.com"
          className="input-field"
          required
          autoComplete="off"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password minimal 8 karakter"
          className="input-field"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value === 'admin' ? 'admin' : 'user')}
          className="input-field"
          style={{ cursor: 'pointer' }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          disabled={loading || !email.trim() || password.length < 8}
          className="btn-primary"
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          {loading ? 'Membuat user...' : 'Tambah User'}
        </button>
      </form>

      {message && (
        <p style={{ color: 'var(--accent-green-light)', fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>
          {message}
        </p>
      )}
      {error && (
        <p style={{ color: '#fca5a5', fontSize: 12, lineHeight: 1.6, marginTop: 12 }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 10, letterSpacing: '0.06em' }}>
          USER TERBARU
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.slice(0, 5).map((user) => (
            <div
              key={user.user_id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'rgba(8, 17, 31, 0.52)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </span>
              <span style={{
                color: user.role === 'admin' ? '#fbbf24' : 'var(--accent-green-light)',
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
                textTransform: 'uppercase',
              }}>
                {user.role}
              </span>
            </div>
          ))}
          {users.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Belum ada user yang bisa ditampilkan.</p>
          )}
        </div>
      </div>
    </section>
  );
}
