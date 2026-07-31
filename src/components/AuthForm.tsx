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
  const [fullName, setFullName] = useState('');
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

    const cleanName = fullName.trim().replace(/\s+/g, ' ');
    if (!isLogin && cleanName.length < 2) {
      setError('Nama wajib diisi minimal 2 karakter.');
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
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });
        if (error) throw error;
        await supabase.auth.signOut();
        setMessage('Pendaftaran berhasil. Silakan masuk dengan akun yang baru dibuat.');
        setFullName('');
        setPassword('');
        setTimeout(() => router.replace('/login'), 700);
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
        <div className="auth-loading">
          <div className="animate-spin-slow" style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(15, 23, 42, 0.12)',
            borderTopColor: 'var(--accent-green)',
            borderRadius: '50%',
          }} />
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-side-panel" aria-label="Tentang Catatin">
          <div>
            <Link href="/" className="auth-brand auth-brand-light" aria-label="Kembali ke Catatin">
              <div className="brand-logo auth-logo">
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
                <p>Expense tracker berbasis AI</p>
              </div>
            </Link>

            <div className="auth-side-copy">
              <p className="auth-eyebrow">Workspace keuangan pribadi</p>
              <h2>{isLogin ? 'Lanjut pantau pengeluaranmu.' : 'Mulai catat tanpa ribet setup.'}</h2>
              <p>
                Tulis pengeluaran seperti chat, Catatin bantu merapikan nominal,
                kategori, dan tanggal ke dashboard yang mudah dipantau.
              </p>
            </div>

            <div className="auth-benefit-list">
              {[
                'Input transaksi cukup satu kalimat',
                'Budget dan riwayat tersimpan rapi',
                'Kategori pengeluaran otomatis terbaca',
              ].map((item) => (
                <div key={item}>
                  <span>
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-preview-card">
            <div>
              <span>Bulan ini</span>
              <strong>Rp 820.000</strong>
            </div>
            <div className="auth-preview-progress">
              <span />
            </div>
            <p>42% dari budget sudah dipakai</p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-topbar">
            <Link href="/" className="auth-back-link">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M9.5 12.5 4.5 7.5l5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Kembali
            </Link>
          </div>

          <div className="auth-card">
            <div className="auth-card-header">
              <p className="section-label">Akses akun</p>
              <h1 className="auth-title">
                {isLogin ? 'Masuk ke Catatin' : 'Buat akun Catatin'}
              </h1>
              <p>
                {isLogin
                  ? 'Lanjutkan pencatatan dan pantau pengeluaran bulan ini.'
                  : 'Daftar gratis untuk mulai mencatat pengeluaran harian.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="auth-form" noValidate>
              {!isLogin && (
                <div>
                  <label htmlFor="name-input" className="field-label">Nama lengkap</label>
                  <input
                    id="name-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama kamu"
                    required
                    autoComplete="name"
                    className="input-field"
                    maxLength={80}
                  />
                </div>
              )}

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
                  style={{ paddingRight: 112 }}
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
                className="btn-primary auth-submit-btn"
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

            <div className="auth-switch">
              <div className="soft-divider" />
              <p>
                {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                <Link href={isLogin ? '/register' : '/login'}>
                  {isLogin ? 'Daftar sekarang' : 'Masuk'}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
