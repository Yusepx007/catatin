'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD_LENGTH = 8;

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

// SVG icon components — no emoji
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Client-side validation
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
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      if (msg.includes('Invalid login credentials')) {
        setError('Email atau password tidak sesuai.');
      } else if (msg.includes('User already registered')) {
        setError('Email sudah terdaftar. Silakan masuk.');
        setIsLogin(true);
      } else if (msg.includes('rate limit')) {
        setError('Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = !isLogin ? getPasswordStrength(password) : null;

  const features = [
    { label: 'Parsing otomatis dengan AI — cukup satu kalimat bebas' },
    { label: 'Dashboard dan grafik pengeluaran per kategori' },
    { label: 'Notifikasi dini ketika pola belanja berisiko' },
    { label: 'Insight mingguan berbasis data transaksi nyata' },
  ];

  if (checkingSession) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent-green)',
            borderRadius: '50%',
          }} className="animate-spin-slow" />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="site-nav">
        <div className="site-nav-inner">
          <div className="brand-lockup">
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
          </div>

          <div className="nav-links">
            <a className="nav-link" href="#fitur">Fitur</a>
            <a className="nav-link" href="#alur">Alur</a>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                setIsLogin(true);
                document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Masuk
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setIsLogin(false);
                document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ padding: '9px 14px', fontSize: 13 }}
            >
              Daftar
            </button>
          </div>
        </div>
      </nav>

      <main className="auth-layout" style={{ position: 'relative' }}>
      <section
        className="landing-copy animate-fade-in-up"
        id="fitur"
      >
        <div style={{ width: '100%', maxWidth: 720 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 18,
            }}>
              <p className="section-label">Catatin</p>
            </div>
            <h1 style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.8rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.05em',
              fontWeight: 800,
              marginBottom: 18,
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              maxWidth: 620,
            }}>
              Catat pengeluaran<br />
              <span style={{ color: 'var(--text-secondary)' }}>lebih cepat, lebih rapi,</span><br />
              <span className="gradient-text">tanpa ribet input manual.</span>
            </h1>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.06rem',
              lineHeight: 1.78,
              maxWidth: 560,
            }}>
              Tulis pengeluaran seperti sedang chat. Catatin bantu membaca nominal,
              kategori, dan tanggal secara otomatis, lalu merangkum semuanya ke dashboard
              yang lebih enak dipantau.
            </p>
          </div>

          <div className="plain-feature-list">
            {features.map((f, i) => (
              <div
                key={i}
                className="plain-feature"
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: 'var(--gradient-green-soft)',
                  border: '1px solid rgba(134, 239, 172, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-green-light)',
                  flexShrink: 0,
                }}>
                  <IconCheck />
                </div>
                <p>{f.label}</p>
              </div>
            ))}
          </div>

          <div className="surface-card" style={{ padding: 22, overflow: 'hidden', display: 'none' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 14,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}>
              <div>
                <p className="section-label" style={{ marginBottom: 10 }}>Preview experience</p>
                <h2 style={{
                  fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                  fontSize: '1.35rem',
                  letterSpacing: '-0.03em',
                }}>
                  Alur sederhana, hasilnya tetap terasa premium
                </h2>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Gratis untuk mulai • dibuat untuk penggunaan harian
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}>
              {[
                ['1', 'Tulis pengeluaran', 'Contoh: beli kopi 25rb tadi pagi'],
                ['2', 'Cek hasil parsing', 'Nominal, kategori, dan tanggal langsung dirapikan'],
                ['3', 'Pantau budget', 'Lihat tren dan warning sebelum pengeluaran kebablasan'],
              ].map(([step, title, desc]) => (
                <div
                  key={step}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: 'rgba(8, 17, 31, 0.58)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: 'var(--accent-green-light)',
                    fontWeight: 700,
                    marginBottom: 14,
                  }}>
                    {step}
                  </div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>{title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="alur" style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
            color: 'var(--text-secondary)',
            fontSize: 13,
            marginTop: 4,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Alur demo:</strong>
            <span>Tulis transaksi</span>
            <span style={{ color: 'var(--accent-green-light)' }}>→</span>
            <span>AI parse otomatis</span>
            <span style={{ color: 'var(--accent-green-light)' }}>→</span>
            <span>Dashboard langsung update</span>
          </div>

          <div style={{
            marginTop: 26,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: 12,
          }}>
            <div className="status-dot" />
            Powered by Catatin AI
            <span style={{ opacity: 0.5 }}>•</span>
            IndonesiaNEXT x Telkomsel
          </div>

          <div className="mvp-feature-grid" aria-label="Fitur MVP Catatin">
            {[
              ['Auth pengguna', 'Daftar dan login mandiri dengan Supabase Auth.'],
              ['AI parser transaksi', 'Input bebas seperti chat, nominal dan kategori langsung dibaca.'],
              ['Dashboard realtime', 'Ringkasan, grafik kategori, budget, dan insight mingguan.'],
              ['CRUD transaksi', 'Tambah, lihat, edit, dan hapus catatan pengeluaran.'],
            ].map(([title, desc]) => (
              <div key={title} className="mvp-feature-card">
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside
        className="landing-auth animate-slide-in-right"
        id="login"
      >
        <div
          className="surface-card"
          style={{
            width: '100%',
            maxWidth: 390,
            padding: 26,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'flex-start',
            marginBottom: 28,
          }}>
            <div>
              <p className="section-label" style={{ marginBottom: 12 }}>Akses akun</p>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                marginBottom: 6,
              }}>
                {isLogin ? 'Masuk ke workspace kamu' : 'Buat akun baru'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {isLogin
                  ? 'Lanjutkan pencatatan dan pantau pengeluaran bulan ini.'
                  : 'Daftar gratis untuk mulai mencatat tanpa setup yang ribet.'}
              </p>
            </div>

            <div style={{ flexShrink: 0, width: 42 }} />
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <div>
              <label
                htmlFor="email-input"
                style={{
                  display: 'block',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Alamat Email
              </label>
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
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Password
              </label>
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
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: '1px solid var(--border)',
                    background: 'rgba(148, 163, 184, 0.06)',
                    color: 'var(--text-secondary)',
                    padding: '6px 10px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>

              {!isLogin && password.length > 0 && strength && (
                <div style={{ marginTop: 10 }}>
                  <div style={{
                    height: 5,
                    background: 'rgba(148, 163, 184, 0.12)',
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}>
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

            {error && (
              <div style={{
                background: 'rgba(248, 113, 113, 0.08)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: 14,
                padding: '12px 14px',
                color: '#fda4af',
                fontSize: 13,
                lineHeight: 1.55,
              }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(134, 239, 172, 0.18)',
                borderRadius: 14,
                padding: '12px 14px',
                color: 'var(--accent-green-light)',
                fontSize: 13,
                lineHeight: 1.55,
              }}>
                {message}
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: 6, minHeight: 50, fontSize: 15 }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                  }} className="animate-spin-slow" />
                  Memproses...
                </>
              ) : isLogin ? 'Masuk ke Dashboard' : 'Buat Akun Gratis'}
            </button>
          </form>

          <div style={{ marginTop: 18 }}>
            <div className="soft-divider" />
            <button
              id="toggle-auth-btn"
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setMessage('');
                setPassword('');
              }}
              style={{
                display: 'block',
                width: '100%',
                color: 'var(--text-secondary)',
                fontSize: 13,
                lineHeight: 1.6,
                marginTop: 18,
                textAlign: 'center',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
            >
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <span style={{ color: 'var(--accent-green-light)', fontWeight: 700 }}>
                {isLogin ? 'Daftar sekarang' : 'Masuk'}
              </span>
            </button>
          </div>
        </div>
      </aside>
      </main>

      <footer className="landing-footer">
        <div>
          <strong>Catatin</strong>
          <span>Full-stack MVP untuk pencatatan pengeluaran berbasis AI.</span>
        </div>
        <div>
          <span>Supabase Auth + Database</span>
          <span>Groq API + fallback AI</span>
          <span>CRUD transaksi</span>
        </div>
      </footer>
    </>
  );
}
