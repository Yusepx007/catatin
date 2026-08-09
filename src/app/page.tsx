'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  {
    n: '01',
    title: 'Tulis bebas',
    body: 'Ketik seperti ngobrol. "Beli kopi 25rb tadi pagi" cukup — tidak perlu isi form apapun.',
  },
  {
    n: '02',
    title: 'AI rapikan',
    body: 'Nominal, kategori, tanggal, dan tipe transaksi langsung terdeteksi otomatis.',
  },
  {
    n: '03',
    title: 'Pantau dashboard',
    body: 'Budget, tren 30 hari, analitik kategori, dan insight mingguan langsung tersedia.',
  },
];

// Semua fitur yang ada di dashboard
const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 2h16v13H11l-5 3.5V15H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'CORE',
    title: 'Input natural language',
    body: 'Tidak perlu isi form. Tulis apa yang terjadi, AI yang parse nominal, kategori, dan tanggalnya.',
    accent: '#4ade80',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14l4.5-6 3.5 3.5 4.5-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 3H18v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'ANALYTICS',
    title: 'Tren keuangan 30 hari',
    body: 'Area chart pemasukan, pengeluaran, dan saldo bersih harian — 30 hari terakhir sekaligus.',
    accent: '#60a5fa',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3a5.5 5.5 0 0 1 2.5 10.3V15H7.5v-1.7A5.5 5.5 0 0 1 10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 16.5h5M8.5 18.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    tag: 'AI',
    title: 'Insight mingguan AI',
    body: 'Analisis pola keuangan 7 hari terakhir — ringkasan otomatis dari AI tanpa perlu baca tabel.',
    accent: '#a78bfa',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 11l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'BUDGET',
    title: 'Budget monitoring',
    body: 'Set budget bulanan, pantau persentase sisa, dan lihat proyeksi pengeluaran akhir bulan.',
    accent: '#f59e0b',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="5.5" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14.5" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 7V3.5M14.5 7V3.5M5.5 13v3.5M14.5 13v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    tag: 'ANALYTICS',
    title: 'Analitik kategori',
    body: 'Pie chart + list breakdown pengeluaran per kategori. Tahu persis uangmu lari ke mana.',
    accent: '#f97316',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 3h12v14H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    tag: 'LAPORAN',
    title: 'Laporan bulanan',
    body: 'Ringkasan lengkap per bulan dengan opsi export ke Excel — cocok untuk arsip atau review keuangan.',
    accent: '#34d399',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13 3l4 4-9 9H4v-4L13 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    tag: 'HISTORY',
    title: 'Edit & hapus transaksi',
    body: 'Salah ketik? Tenang. Setiap transaksi bisa diedit atau dihapus langsung dari riwayat.',
    accent: '#fb7185',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 8h16M6 12h1M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    tag: 'HISTORY',
    title: 'Riwayat 12 bulan',
    body: 'Filter transaksi per bulan — akses histori hingga 12 bulan ke belakang kapan saja.',
    accent: '#22d3ee',
  },
];

// Dashboard preview tab content
const dashboardTabs = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'record', label: 'Catat' },
  { id: 'insight', label: 'Insight' },
  { id: 'report', label: 'Laporan' },
];

// ─── Inline CSS animations ─────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

  @keyframes pulse-glow {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px #4ade80; }
    50% { opacity: 0.6; box-shadow: 0 0 16px #4ade80; }
  }
  @keyframes float-y {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .feature-card-hover {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .feature-card-hover:hover {
    transform: translateY(-3px);
    border-color: rgba(74, 222, 128, 0.22) !important;
    background: rgba(255,255,255,0.055) !important;
  }

  .cta-btn-primary {
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .cta-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 50px rgba(34,197,94,0.42) !important;
  }
  .cta-btn-primary:active {
    transform: translateY(0) scale(0.98);
  }

  .nav-link-hover {
    transition: color 0.18s ease;
  }
  .nav-link-hover:hover {
    color: #86efac !important;
  }

  .tab-btn {
    transition: all 0.18s ease;
    cursor: pointer;
  }
  .tab-btn:hover:not(.tab-active) {
    color: #e2e8f0 !important;
  }

  .step-card {
    transition: background 0.2s ease;
  }
  .step-card:hover {
    background: rgba(34,197,94,0.04) !important;
  }

  @media (max-width: 900px) {
    .landing-hero-grid { grid-template-columns: 1fr !important; }
    .features-grid { grid-template-columns: 1fr 1fr !important; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .footer-row { flex-direction: column !important; align-items: flex-start !important; }
  }
  @media (max-width: 560px) {
    .features-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{
      background: '#040f0a',
      color: '#e2e8f0',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: 'rgba(4, 15, 10, 0.88)',
        borderBottom: '1px solid rgba(134, 239, 172, 0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div style={{
          width: 'min(1180px, calc(100% - 32px))',
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}>
          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              overflow: 'hidden', flexShrink: 0,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(134,239,172,0.18)',
            }}>
              <Image src="/logo.png" alt="Catatin" width={34} height={34}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} priority />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#f0fdf4', letterSpacing: '-0.01em' }}>Catatin</span>
          </Link>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { href: '#cara-kerja', label: 'Cara kerja' },
              { href: '#fitur', label: 'Fitur' },
              { href: '#preview', label: 'Preview' },
            ].map(({ href, label }) => (
              <a key={href} href={href} className="nav-link-hover" style={{
                color: 'rgba(226,232,240,0.6)',
                fontSize: 13,
                fontWeight: 500,
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
              }}>{label}</a>
            ))}
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <Link href="/login" style={{
              color: 'rgba(226,232,240,0.72)',
              fontSize: 13, fontWeight: 500,
              padding: '8px 12px', borderRadius: 8,
              textDecoration: 'none',
            }}>Masuk</Link>
            <Link href="/register" className="cta-btn-primary" style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', fontSize: 13, fontWeight: 600,
              padding: '9px 18px', borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(34,197,94,0.28)',
              letterSpacing: '-0.01em',
            }}>Mulai gratis</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: 64,
      }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image src="/landing-bg.png" alt="" fill priority quality={90}
            style={{ objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(4,15,10,0.90) 0%, rgba(4,15,10,0.55) 50%, rgba(4,15,10,0.85) 100%)',
          }} />
        </div>

        {/* Content */}
        <div className="landing-hero-grid" style={{
          position: 'relative', zIndex: 1,
          width: 'min(1180px, calc(100% - 32px))',
          margin: '0 auto',
          paddingTop: 48, paddingBottom: 64,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)',
          gap: 64,
          alignItems: 'center',
        }}>
          {/* Left copy */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(134,239,172,0.2)',
              marginBottom: 24,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 8px #4ade80',
                animation: 'pulse-glow 2s ease infinite',
                flexShrink: 0,
              }} />
              <span style={{ color: '#86efac', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em' }}>
                Finance tracker berbasis AI
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontWeight: 800, lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#f0fdf4', marginBottom: 20,
              maxWidth: '13ch',
            }}>
              Catat keuangan dengan satu kalimat.
            </h1>

            <p style={{
              fontSize: 16, lineHeight: 1.7,
              color: 'rgba(226,232,240,0.72)',
              marginBottom: 36, maxWidth: '44ch',
            }}>
              Ketik bebas, AI yang baca nominalnya, tentukan kategorinya, dan rapikan ke dashboard lengkap — tren 30 hari, budget, insight mingguan, laporan Excel.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 48 }}>
              <Link href="/register" className="cta-btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white', fontWeight: 700, fontSize: 15,
                padding: '14px 28px', borderRadius: 14,
                textDecoration: 'none',
                boxShadow: '0 14px 40px rgba(34,197,94,0.32)',
                letterSpacing: '-0.01em',
              }}>
                Mulai catat gratis
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#fitur" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(226,232,240,0.8)',
                fontWeight: 600, fontSize: 15,
                padding: '14px 24px', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}>
                Lihat semua fitur
              </a>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                ['1 kalimat', 'untuk catat transaksi'],
                ['8 fitur', 'dalam satu dashboard'],
                ['Realtime', 'update & insight AI'],
              ].map(([val, lbl]) => (
                <div key={val}>
                  <p style={{ fontSize: 17, fontWeight: 800, color: '#86efac', marginBottom: 2, letterSpacing: '-0.02em' }}>{val}</p>
                  <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.6)', fontWeight: 500 }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — product preview card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(134,239,172,0.12)',
            borderRadius: 24, overflow: 'hidden',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            {/* Card topbar */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.55)', marginBottom: 3, fontWeight: 500 }}>Dashboard bulan ini</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>Rp 4.300.000</p>
              </div>
              <span style={{
                background: 'rgba(74,222,128,0.14)',
                border: '1px solid rgba(74,222,128,0.24)',
                color: '#4ade80', fontSize: 11, fontWeight: 700,
                padding: '4px 10px', borderRadius: 999,
              }}>Aktif</span>
            </div>

            {/* Income / expense */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ padding: '12px 20px', background: 'rgba(4,15,10,0.6)' }}>
                <p style={{ fontSize: 10, color: 'rgba(187,247,208,0.5)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.06em' }}>PEMASUKAN</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#4ade80', letterSpacing: '-0.02em' }}>+Rp 5.000.000</p>
              </div>
              <div style={{ padding: '12px 20px', background: 'rgba(4,15,10,0.6)', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: 10, color: 'rgba(252,165,165,0.5)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.06em' }}>PENGELUARAN</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#fca5a5', letterSpacing: '-0.02em' }}>-Rp 700.000</p>
              </div>
            </div>

            {/* Chat demo */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                alignSelf: 'flex-end',
                background: 'rgba(34,197,94,0.18)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '16px 16px 4px 16px',
                padding: '10px 14px', fontSize: 13, color: '#bbf7d0', maxWidth: '80%',
              }}>
                bayar paylater 150rb kemarin
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px 16px 16px 16px',
                padding: '12px 14px', maxWidth: '88%',
              }}>
                <p style={{ fontSize: 10, color: 'rgba(187,247,208,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>TRANSAKSI TERBACA</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.78)', marginBottom: 2 }}>Paylater &amp; Cicilan</p>
                    <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.45)' }}>08 Agustus 2026</p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em', flexShrink: 0 }}>Rp 150.000</p>
                </div>
              </div>
            </div>

            {/* AI Insight teaser */}
            <div style={{
              margin: '0 20px',
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.18)',
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.7)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 5 }}>INSIGHT MINGGUAN AI</p>
              <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.65)', lineHeight: 1.55 }}>
                Pengeluaran minggu ini naik 18% dari rata-rata. Kategori terbesar: Makanan &amp; Minuman.
              </p>
            </div>

            {/* Budget bar */}
            <div style={{ padding: '12px 20px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(187,247,208,0.5)', fontWeight: 500 }}>Progress budget</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>14%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '14%', height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: 999 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="cara-kerja" style={{
        background: '#040f0a',
        borderTop: '1px solid rgba(134,239,172,0.07)',
        padding: '96px 0',
      }}>
        <div style={{ width: 'min(1180px, calc(100% - 32px))', margin: '0 auto' }}>
          <div style={{ marginBottom: 64 }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontWeight: 800, letterSpacing: '-0.025em',
              color: '#f0fdf4', lineHeight: 1.15, marginBottom: 14,
            }}>
              Dari catatan mentah,<br />jadi insight siap baca.
            </h2>
            <p style={{ color: 'rgba(226,232,240,0.55)', fontSize: 15, maxWidth: '44ch', lineHeight: 1.65 }}>
              Tiga langkah. Tulis, baca, pantau. Tidak ada setup, tidak ada form panjang.
            </p>
          </div>

          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            background: 'rgba(134,239,172,0.06)',
            borderRadius: 20, overflow: 'hidden',
            border: '1px solid rgba(134,239,172,0.08)',
          }}>
            {steps.map((step, i) => (
              <div key={step.n} className="step-card" style={{
                padding: '36px 32px',
                background: '#040f0a',
                borderRight: i < 2 ? '1px solid rgba(134,239,172,0.07)' : 'none',
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: '#4ade80',
                  letterSpacing: '0.12em', marginBottom: 20,
                  fontVariantNumeric: 'tabular-nums',
                }}>{step.n}</p>
                <h3 style={{
                  fontSize: 18,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontWeight: 700, color: '#f0fdf4',
                  marginBottom: 10, letterSpacing: '-0.01em',
                }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(226,232,240,0.5)', lineHeight: 1.65 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="fitur" style={{
        background: '#050e09',
        borderTop: '1px solid rgba(134,239,172,0.06)',
        padding: '96px 0',
      }}>
        <div style={{ width: 'min(1180px, calc(100% - 32px))', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 56, maxWidth: '52ch' }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontWeight: 800, letterSpacing: '-0.025em',
              color: '#f0fdf4', lineHeight: 1.15, marginBottom: 16,
            }}>
              Semua yang kamu butuhkan,<br />sudah ada di dalam.
            </h2>
            <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 15, lineHeight: 1.7 }}>
              Bukan cuma catat. Catatin punya 8 fitur lengkap — dari input AI hingga laporan Excel — tanpa perlu aplikasi tambahan.
            </p>
          </div>

          {/* 4-col feature grid */}
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}>
            {features.map((feat) => (
              <div key={feat.title} className="feature-card-hover" style={{
                padding: '24px 22px',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(134,239,172,0.09)',
                borderRadius: 18,
              }}>
                {/* Tag */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    color: feat.accent,
                    background: `${feat.accent}18`,
                    border: `1px solid ${feat.accent}30`,
                    padding: '3px 8px', borderRadius: 999,
                  }}>{feat.tag}</span>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${feat.accent}12`,
                    border: `1px solid ${feat.accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: feat.accent, flexShrink: 0,
                  }}>
                    {feat.icon}
                  </div>
                </div>
                <h3 style={{
                  fontSize: 14, fontWeight: 700,
                  color: '#e2e8f0', marginBottom: 8,
                  letterSpacing: '-0.01em',
                }}>{feat.title}</h3>
                <p style={{ fontSize: 12.5, color: 'rgba(226,232,240,0.48)', lineHeight: 1.6 }}>{feat.body}</p>
              </div>
            ))}
          </div>

          {/* CTA below grid */}
          <div style={{ marginTop: 48, display: 'flex', justifyContent: 'center' }}>
            <Link href="/register" className="cta-btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', fontWeight: 700, fontSize: 15,
              padding: '14px 32px', borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 14px 40px rgba(34,197,94,0.28)',
              letterSpacing: '-0.01em',
            }}>
              Coba semua fitur gratis
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW (Tab switcher) ── */}
      <section id="preview" style={{
        background: '#040f0a',
        borderTop: '1px solid rgba(134,239,172,0.07)',
        padding: '96px 0',
      }}>
        <div style={{ width: 'min(1180px, calc(100% - 32px))', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontWeight: 800, letterSpacing: '-0.025em',
              color: '#f0fdf4', lineHeight: 1.15, marginBottom: 14,
            }}>
              Lihat sendiri dashboardnya.
            </h2>
            <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 15, lineHeight: 1.65 }}>
              Bersih, cepat, dan semua data yang kamu butuhkan ada di satu tempat.
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 4,
            marginBottom: 32,
            padding: 5,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(134,239,172,0.09)',
            borderRadius: 16,
            width: 'fit-content',
            margin: '0 auto 32px',
          }}>
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                style={{
                  padding: '9px 20px',
                  borderRadius: 12, cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  fontFamily: 'inherit',
                  background: activeTab === tab.id
                    ? 'rgba(34,197,94,0.14)'
                    : 'transparent',
                  color: activeTab === tab.id
                    ? '#4ade80'
                    : 'rgba(226,232,240,0.45)',
                  border: activeTab === tab.id
                    ? '1px solid rgba(74,222,128,0.22)'
                    : '1px solid transparent',
                  transition: 'all 0.18s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview panel */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(134,239,172,0.1)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          }}>
            {/* Mock window chrome */}
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,100,100,0.5)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,190,50,0.5)' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(60,200,100,0.5)' }} />
              <span style={{
                flex: 1, textAlign: 'center', fontSize: 11,
                color: 'rgba(187,247,208,0.3)', fontWeight: 500,
              }}>catatin.app/dashboard</span>
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div style={{ padding: 28 }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Total Pemasukan', value: 'Rp 5.000.000', color: '#4ade80', sub: '3 transaksi' },
                    { label: 'Total Pengeluaran', value: 'Rp 700.000', color: '#fca5a5', sub: '5 transaksi' },
                    { label: 'Saldo Bersih', value: '+Rp 4.300.000', color: '#60a5fa', sub: 'Pemasukan − Pengeluaran' },
                    { label: 'Budget Bulanan', value: 'Rp 3.000.000', color: '#a78bfa', sub: '14% terpakai' },
                  ].map((s) => (
                    <div key={s.label} style={{
                      padding: '16px 18px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 14,
                    }}>
                      <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.45)', marginBottom: 8, fontWeight: 500 }}>{s.label}</p>
                      <p style={{ fontSize: 17, fontWeight: 800, color: s.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{s.value}</p>
                      <p style={{ fontSize: 10.5, color: 'rgba(187,247,208,0.35)' }}>{s.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Mock area chart */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, padding: '18px 20px',
                }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(187,247,208,0.55)', marginBottom: 16 }}>Tren Keuangan (30 Hari Terakhir)</p>
                  <svg viewBox="0 0 600 120" fill="none" style={{ width: '100%', height: 120 }}>
                    <defs>
                      <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Income area */}
                    <path d="M0 90 C50 85 100 60 150 55 S250 70 300 50 S400 30 450 40 S550 55 600 45 L600 120 L0 120Z" fill="url(#gIncome)" />
                    <path d="M0 90 C50 85 100 60 150 55 S250 70 300 50 S400 30 450 40 S550 55 600 45" stroke="#22c55e" strokeWidth="2" fill="none" />
                    {/* Expense area */}
                    <path d="M0 100 C80 98 150 95 200 92 S320 88 380 90 S500 93 600 88 L600 120 L0 120Z" fill="url(#gExpense)" />
                    <path d="M0 100 C80 98 150 95 200 92 S320 88 380 90 S500 93 600 88" stroke="#f97316" strokeWidth="2" fill="none" />
                    {/* Balance */}
                    <path d="M0 105 C60 100 120 85 180 75 S280 65 350 60 S450 50 600 42 L600 120 L0 120Z" fill="url(#gBalance)" />
                    <path d="M0 105 C60 100 120 85 180 75 S280 65 350 60 S450 50 600 42" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
                  </svg>
                  <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
                    {[['#22c55e','Pemasukan'],['#f97316','Pengeluaran'],['#8b5cf6','Saldo Bersih']].map(([c,l]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'rgba(187,247,208,0.4)' }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'record' && (
              <div style={{ padding: 28 }}>
                <div style={{ maxWidth: 560, margin: '0 auto' }}>
                  <p style={{ fontSize: 13, color: 'rgba(187,247,208,0.5)', marginBottom: 20, fontWeight: 500 }}>Catat transaksi dengan bahasa alami</p>
                  {/* Chat history */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {[
                      { who: 'user', msg: 'gaji bulan ini 5jt' },
                      { who: 'ai', cat: 'Gaji / Honor', amt: 'Rp 5.000.000', date: '08 Agustus 2026', type: 'income' },
                      { who: 'user', msg: 'makan siang warteg 18rb' },
                      { who: 'ai', cat: 'Makanan & Minuman', amt: 'Rp 18.000', date: '08 Agustus 2026', type: 'expense' },
                    ].map((item, i) => item.who === 'user' ? (
                      <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '75%' }}>
                        <div style={{
                          background: 'rgba(34,197,94,0.16)', border: '1px solid rgba(74,222,128,0.2)',
                          borderRadius: '14px 14px 4px 14px', padding: '10px 14px',
                          fontSize: 13, color: '#bbf7d0',
                        }}>{item.msg}</div>
                      </div>
                    ) : (
                      <div key={i} style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                          borderRadius: '4px 14px 14px 14px', padding: '12px 14px',
                        }}>
                          <p style={{ fontSize: 9, color: 'rgba(187,247,208,0.45)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.08em' }}>TERSIMPAN</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div>
                              <p style={{ fontSize: 12.5, color: 'rgba(226,232,240,0.8)', marginBottom: 2 }}>{item.cat}</p>
                              <p style={{ fontSize: 10.5, color: 'rgba(187,247,208,0.4)' }}>{item.date}</p>
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em', flexShrink: 0, color: item.type === 'income' ? '#4ade80' : '#fca5a5' }}>
                              {item.type === 'income' ? '+' : '-'}{item.amt}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Input */}
                  <div style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(134,239,172,0.15)',
                    borderRadius: 14,
                  }}>
                    <p style={{ flex: 1, fontSize: 13, color: 'rgba(226,232,240,0.3)' }}>Tulis transaksi apa saja...</p>
                    <div style={{
                      padding: '7px 14px', borderRadius: 9,
                      background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                      fontSize: 12, fontWeight: 600, color: 'white',
                    }}>Kirim</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insight' && (
              <div style={{ padding: 28, maxWidth: 640 }}>
                <p style={{ fontSize: 13, color: 'rgba(187,247,208,0.5)', marginBottom: 24, fontWeight: 500 }}>Insight Mingguan AI — 7 hari terakhir</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: '📊', title: 'Pengeluaran mingguan', body: 'Total pengeluaran minggu ini Rp 285.000, naik 12% dari minggu lalu. Perhatikan kategori Makanan & Minuman.' },
                    { icon: '💡', title: 'Pola belanja', body: 'Kamu paling banyak berbelanja di hari Rabu dan Jumat. Coba rencanakan anggaran harian lebih ketat di hari itu.' },
                    { icon: '✅', title: 'Budget aman', body: 'Pengeluaran bulan ini masih 14% dari budget. Kamu on track untuk bulan yang hemat!' },
                  ].map((ins) => (
                    <div key={ins.title} style={{
                      padding: '16px 18px',
                      background: 'rgba(139,92,246,0.07)',
                      border: '1px solid rgba(139,92,246,0.16)',
                      borderRadius: 14,
                      display: 'flex', gap: 14,
                    }}>
                      <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{ins.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{ins.title}</p>
                        <p style={{ fontSize: 12.5, color: 'rgba(226,232,240,0.5)', lineHeight: 1.6 }}>{ins.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <div style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: 'rgba(187,247,208,0.5)', fontWeight: 500 }}>Laporan Bulanan — Agustus 2026</p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    fontSize: 12, color: 'rgba(226,232,240,0.55)', fontWeight: 600,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5v7M4.2 5.8 7 8.6l2.8-2.8M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Export Excel
                  </div>
                </div>
                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <p style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, marginBottom: 8 }}>TOTAL PEMASUKAN</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.02em' }}>Rp 5.000.000</p>
                    <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.4)', marginTop: 4 }}>3 transaksi</p>
                  </div>
                  <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.15)' }}>
                    <p style={{ fontSize: 10, color: '#ea580c', fontWeight: 700, marginBottom: 8 }}>TOTAL PENGELUARAN</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#ea580c', letterSpacing: '-0.02em' }}>Rp 700.000</p>
                    <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.4)', marginTop: 4 }}>5 transaksi</p>
                  </div>
                </div>
                {/* Tx list sample */}
                {[
                  { cat: 'Gaji / Honor', desc: 'Gaji bulan Agustus', amt: '+Rp 5.000.000', date: '01 Agt', type: 'income' },
                  { cat: 'Makanan & Minuman', desc: 'Makan siang warteg', amt: '-Rp 18.000', date: '08 Agt', type: 'expense' },
                  { cat: 'Paylater & Cicilan', desc: 'Bayar paylater Shopee', amt: '-Rp 150.000', date: '07 Agt', type: 'expense' },
                ].map((t) => (
                  <div key={t.desc} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(134,239,172,0.06)',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: t.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${t.type === 'income' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800,
                      color: t.type === 'income' ? '#4ade80' : '#fca5a5',
                    }}>{t.cat.slice(0,2).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#e2e8f0' }}>{t.desc}</p>
                      <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.4)' }}>{t.cat} · {t.date}</p>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: t.type === 'income' ? '#4ade80' : '#fca5a5', flexShrink: 0 }}>{t.amt}</p>
                    {/* Edit / Delete actions */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8 1.5l2.5 2.5L4 10.5H1.5V8L8 1.5z" stroke="rgba(187,247,208,0.4)" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                      </div>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(239,68,68,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4.5 3V2h3v1M5 5.5v4M7 5.5v4M3 3l.6 7h4.8L9 3" stroke="rgba(252,165,165,0.5)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{
        background: '#040f0a',
        borderTop: '1px solid rgba(134,239,172,0.07)',
        padding: '88px 0',
        textAlign: 'center',
      }}>
        <div style={{ width: 'min(620px, calc(100% - 32px))', margin: '0 auto' }}>
          {/* Green glow blob */}
          <div style={{
            width: 240, height: 240,
            background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            margin: '0 auto -80px',
            pointerEvents: 'none',
          }} />
          <p style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontWeight: 800, color: '#f0fdf4',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            marginBottom: 16, position: 'relative', zIndex: 1,
          }}>
            Mulai rapi hari ini — gratis.
          </p>
          <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 36 }}>
            Tidak perlu kartu kredit. Tidak perlu setup. Langsung catat.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="cta-btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white', fontWeight: 700, fontSize: 15,
              padding: '15px 36px', borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 16px 48px rgba(34,197,94,0.32)',
              letterSpacing: '-0.01em',
            }}>
              Mulai gratis sekarang
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'rgba(226,232,240,0.55)',
              fontSize: 14, fontWeight: 500,
              padding: '15px 24px', borderRadius: 14,
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.09)',
            }}>
              Sudah punya akun
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#020b06',
        borderTop: '1px solid rgba(134,239,172,0.06)',
        padding: '28px 0',
      }}>
        <div className="footer-row" style={{
          width: 'min(1180px, calc(100% - 32px))',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, overflow: 'hidden',
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(134,239,172,0.14)',
            }}>
              <Image src="/logo.png" alt="Catatin" width={24} height={24}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'rgba(187,247,208,0.4)', fontWeight: 500 }}>
                Catatin — Dibuat oleh Yusep
              </span>
              <a
                href="https://instagram.com/yusepx007"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, color: 'rgba(187,247,208,0.35)',
                  textDecoration: 'none', fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#86efac')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(187,247,208,0.35)')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
                @yusepx007
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="#fitur" style={{ fontSize: 13, color: 'rgba(187,247,208,0.35)', textDecoration: 'none', fontWeight: 500 }}>Fitur</a>
            <a href="#preview" style={{ fontSize: 13, color: 'rgba(187,247,208,0.35)', textDecoration: 'none', fontWeight: 500 }}>Preview</a>
            {['Masuk', 'Daftar'].map((label) => (
              <Link key={label} href={label === 'Masuk' ? '/login' : '/register'} style={{
                fontSize: 13,
                color: 'rgba(187,247,208,0.35)',
                textDecoration: 'none',
                fontWeight: 500,
              }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
