'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 8;

type AuthMode = 'login' | 'register';

type Props = {
  mode: AuthMode;
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password minimal ${MIN_PASSWORD_LENGTH} karakter`;
  }
  return null;
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: 'transparent', width: '0%' };
  if (password.length < 8) return { label: 'Terlalu pendek', color: '#ef4444', width: '25%' };
  if (password.length < 10) return { label: 'Lemah', color: '#f59e0b', width: '50%' };
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Sedang', color: '#3b82f6', width: '75%' };
  return { label: 'Kuat', color: '#10b981', width: '100%' };
}

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const strength = !isLogin ? getPasswordStrength(password) : null;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
        return;
      }
      setCheckingSession(false);
    };

    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail(email)) {
      setError('Format email tidak valid.');
      return;
    }

    const passwordError = !isLogin ? validatePassword(password) : null;
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        setMessage('Pendaftaran berhasil. Silakan masuk dengan akun yang baru dibuat.');
        setPassword('');
        setTimeout(() => router.push('/login'), 700);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      if (msg.includes('Invalid login credentials')) {
        setError('Email atau password tidak sesuai.');
      } else if (msg.includes('User already registered')) {
        setError('Email sudah terdaftar. Silakan masuk.');
      } else if (msg.includes('rate limit')) {
        setError('Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="auth-page">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="animate-spin-slow" style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent-green)',
            borderRadius: '50%',
          }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="auth-page">
      <Link href="/" className="auth-brand" aria-label="Kembali ke landing Catatin">
        <div className="brand-logo">
          <Image
            src="/logo.png"
            alt="Catatin"
            width={44}
            height={44}
            priority
            className="logo-clean"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div>
          <p className="brand-title">Catatin</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Expense tracker berbasis AI</p>
        </div>
      </Link>

      <section className="surface-card auth-card">
        <div style={{ marginBottom: 28 }}>
          <p className="section-label" style={{ marginBottom: 12 }}>Akses akun</p>
          <h1 className="auth-title">
            {isLogin ? 'Masuk ke workspace kamu' : 'Buat akun baru'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            {isLogin
              ? 'Lanjutkan pencatatan dan pantau pengeluaran bulan ini.'
              : 'Daftar gratis untuk mulai mencatat tanpa setup yang ribet.'}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <div>
            <label htmlFor="email-input" className="field-label">Alamat Email</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password-input" className="field-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Masukkan password' : `Minimal ${MIN_PASSWORD_LENGTH} karakter`}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={isLogin ? 1 : MIN_PASSWORD_LENGTH}
                className="input-field"
                style={{ paddingRight: 94 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                tabIndex={-1}
              >
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>

            {!isLogin && password.length > 0 && strength && (
              <div style={{ marginTop: 10 }}>
                <div className="password-strength-track">
                  <div style={{
                    height: '100%',
                    width: strength.width,
                    background: strength.color,
                    borderRadius: 999,
                    transition: 'width 0.3s ease, background 0.3s ease',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: strength.color, marginTop: 6 }}>
                  Kekuatan password: {strength.label}
                </p>
              </div>
            )}
          </div>

          {error && <div className="auth-alert auth-alert-error">{error}</div>}
          {message && <div className="auth-alert auth-alert-success">{message}</div>}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: 6, minHeight: 50, fontSize: 15 }}
          >
            {loading ? (
              <>
                <div className="animate-spin-slow" style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                }} />
                Memproses...
              </>
            ) : isLogin ? 'Masuk ke Dashboard' : 'Buat Akun Gratis'}
          </button>
        </form>

        <div style={{ marginTop: 18 }}>
          <div className="soft-divider" />
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 13,
            lineHeight: 1.6,
            marginTop: 18,
            textAlign: 'center',
          }}>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <Link href={isLogin ? '/register' : '/login'} style={{ color: 'var(--accent-green-light)', fontWeight: 700 }}>
              {isLogin ? 'Daftar sekarang' : 'Masuk'}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
