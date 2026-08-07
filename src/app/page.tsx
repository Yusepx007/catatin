import Image from 'next/image';
import Link from 'next/link';

// ─── Data ────────────────────────────────────────────────────────────────────

const steps = [
  {
    n: '01',
    title: 'Tulis bebas',
    body: 'Ketik seperti ngobrol. "Beli kopi 25rb tadi pagi" cukup.',
  },
  {
    n: '02',
    title: 'Catatin rapikan',
    body: 'Nominal, kategori, dan tanggal langsung terdeteksi otomatis.',
  },
  {
    n: '03',
    title: 'Pantau dashboard',
    body: 'Budget, riwayat, dan pola keuanganmu langsung terupdate.',
  },
];

const capabilities = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 2h14v11H10l-4 3v-3H2V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Input natural language',
    body: 'Tidak perlu isi form. Tulis saja apa yang terjadi.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Catat pemasukan',
    body: 'Gaji, freelance, bonus — semua kategori tersedia.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 10l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Budget monitoring',
    body: 'Progress bulan ini terlihat tanpa hitung manual.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 13l4-5 3 3 4-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Analitik kategori',
    body: 'Lihat pola belanja dengan grafik yang mudah dibaca.',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{
      background: '#040f0a',
      color: '#e2e8f0',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: 'rgba(4, 15, 10, 0.85)',
        borderBottom: '1px solid rgba(134, 239, 172, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
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
              width: 34,
              height: 34,
              borderRadius: 9,
              overflow: 'hidden',
              flexShrink: 0,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(134,239,172,0.18)',
            }}>
              <Image src="/logo.png" alt="Catatin" width={34} height={34}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} priority />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#f0fdf4', letterSpacing: '-0.01em' }}>Catatin</span>
          </Link>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <a href="#cara-kerja" style={{
              color: 'rgba(226,232,240,0.6)',
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: 8,
              transition: 'color 0.2s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#86efac')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,232,240,0.6)')}
            >Cara kerja</a>
            <a href="#fitur" style={{
              color: 'rgba(226,232,240,0.6)',
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: 8,
              transition: 'color 0.2s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#86efac')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,232,240,0.6)')}
            >Fitur</a>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            <Link href="/login" style={{
              color: 'rgba(226,232,240,0.72)',
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
            }}>Masuk</Link>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              padding: '9px 18px',
              borderRadius: 10,
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
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image src="/landing-bg.png" alt="" fill priority quality={90}
            style={{ objectFit: 'cover', objectPosition: 'center' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(4,15,10,0.88) 0%, rgba(4,15,10,0.54) 50%, rgba(4,15,10,0.82) 100%)',
          }} />
        </div>

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: 'min(1180px, calc(100% - 32px))',
          margin: '0 auto',
          paddingTop: 48,
          paddingBottom: 64,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)',
          gap: 64,
          alignItems: 'center',
        }} className="landing-hero-grid-pro">

          {/* Left copy */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
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

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#f0fdf4',
              marginBottom: 20,
              maxWidth: '13ch',
            }}>
              Catat keuangan dengan satu kalimat.
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'rgba(226,232,240,0.72)',
              marginBottom: 36,
              maxWidth: '44ch',
            }}>
              Ketik bebas, Catatin yang baca nominalnya, tentukan kategorinya, dan rapikan ke dashboard yang siap kamu pantau setiap hari.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 48 }}>
              <Link href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                fontWeight: 700,
                fontSize: 15,
                padding: '14px 28px',
                borderRadius: 14,
                textDecoration: 'none',
                boxShadow: '0 14px 40px rgba(34,197,94,0.32)',
                letterSpacing: '-0.01em',
              }}>
                Mulai catat gratis
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#cara-kerja" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(226,232,240,0.8)',
                fontWeight: 600,
                fontSize: 15,
                padding: '14px 24px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.1)',
                textDecoration: 'none',
              }}>
                Lihat cara kerja
              </a>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                ['1 kalimat', 'untuk catat transaksi'],
                ['20+', 'kategori otomatis'],
                ['Realtime', 'update dashboard'],
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
            borderRadius: 24,
            overflow: 'hidden',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            {/* Card topbar */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.55)', marginBottom: 3, fontWeight: 500 }}>Dashboard bulan ini</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em' }}>Rp 4.300.000</p>
              </div>
              <span style={{
                background: 'rgba(74,222,128,0.14)',
                border: '1px solid rgba(74,222,128,0.24)',
                color: '#4ade80',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 999,
              }}>Aktif</span>
            </div>

            {/* Income / expense pills */}
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
                padding: '10px 14px',
                fontSize: 13,
                color: '#bbf7d0',
                maxWidth: '80%',
              }}>
                bayar paylater 150rb kemarin
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px 16px 16px 16px',
                padding: '12px 14px',
                maxWidth: '88%',
              }}>
                <p style={{ fontSize: 10, color: 'rgba(187,247,208,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em' }}>TRANSAKSI TERBACA</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.78)', marginBottom: 2 }}>Paylater &amp; Cicilan</p>
                    <p style={{ fontSize: 11, color: 'rgba(187,247,208,0.45)' }}>31 Jul 2026</p>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.02em', flexShrink: 0 }}>Rp 150.000</p>
                </div>
              </div>
            </div>

            {/* Budget bar */}
            <div style={{
              padding: '12px 20px 16px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
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
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#f0fdf4',
              lineHeight: 1.15,
              marginBottom: 14,
            }}>
              Dari catatan mentah,<br />jadi insight siap baca.
            </h2>
            <p style={{ color: 'rgba(226,232,240,0.55)', fontSize: 15, maxWidth: '44ch', lineHeight: 1.65 }}>
              Tiga langkah — tulis, baca, pantau. Tidak ada lebih dari itu.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            background: 'rgba(134,239,172,0.06)',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(134,239,172,0.08)',
          }} className="steps-grid-pro">
            {steps.map((step, i) => (
              <div key={step.n} style={{
                padding: '36px 32px',
                background: '#040f0a',
                borderRight: i < 2 ? '1px solid rgba(134,239,172,0.07)' : 'none',
                position: 'relative',
              }}>
                <p style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#4ade80',
                  letterSpacing: '0.12em',
                  marginBottom: 20,
                  fontVariantNumeric: 'tabular-nums',
                }}>{step.n}</p>
                <h3 style={{
                  fontSize: 18,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontWeight: 700,
                  color: '#f0fdf4',
                  marginBottom: 10,
                  letterSpacing: '-0.01em',
                }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(226,232,240,0.5)', lineHeight: 1.65 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section id="fitur" style={{
        background: '#061209',
        borderTop: '1px solid rgba(134,239,172,0.06)',
        padding: '96px 0',
      }}>
        <div style={{ width: 'min(1180px, calc(100% - 32px))', margin: '0 auto' }}>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1fr)',
            gap: 80,
            alignItems: 'start',
          }} className="capabilities-grid-pro">

            {/* Left sticky header */}
            <div style={{ position: 'sticky', top: 100 }}>
              <h2 style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#f0fdf4',
                lineHeight: 1.15,
                marginBottom: 16,
              }}>
                Semua yang kamu butuhkan, tanpa yang tidak perlu.
              </h2>
              <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 14.5, lineHeight: 1.7, marginBottom: 36 }}>
                Catatin dirancang untuk seseorang yang ingin keuangannya rapi — bukan orang yang mau belajar aplikasi baru.
              </p>
              <Link href="/register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(74,222,128,0.2)',
                color: '#4ade80',
                fontWeight: 600,
                fontSize: 14,
                padding: '12px 20px',
                borderRadius: 12,
                textDecoration: 'none',
              }}>
                Coba sekarang
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M2.5 6.5h8M7.5 3.5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Right capability list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {capabilities.map((cap, i) => (
                <div key={cap.title} style={{
                  padding: '28px 0',
                  borderBottom: i < capabilities.length - 1 ? '1px solid rgba(134,239,172,0.07)' : 'none',
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(34,197,94,0.09)',
                    border: '1px solid rgba(74,222,128,0.14)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4ade80',
                    flexShrink: 0,
                  }}>
                    {cap.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#e2e8f0',
                      marginBottom: 6,
                      letterSpacing: '-0.01em',
                    }}>{cap.title}</h3>
                    <p style={{ fontSize: 13.5, color: 'rgba(226,232,240,0.5)', lineHeight: 1.65 }}>{cap.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{
        background: '#040f0a',
        borderTop: '1px solid rgba(134,239,172,0.07)',
        padding: '80px 0',
        textAlign: 'center',
      }}>
        <div style={{ width: 'min(640px, calc(100% - 32px))', margin: '0 auto' }}>
          <p style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            fontWeight: 800,
            color: '#f0fdf4',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            Mulai catat hari ini — gratis.
          </p>
          <p style={{ color: 'rgba(226,232,240,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            Tidak perlu kartu kredit. Tidak perlu setup rumit.
          </p>
          <Link href="/register" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            fontWeight: 700,
            fontSize: 15,
            padding: '15px 32px',
            borderRadius: 14,
            textDecoration: 'none',
            boxShadow: '0 16px 48px rgba(34,197,94,0.3)',
            letterSpacing: '-0.01em',
          }}>
            Mulai gratis sekarang
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#020b06',
        borderTop: '1px solid rgba(134,239,172,0.06)',
        padding: '28px 0',
      }}>
        <div style={{
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
            <span style={{ fontSize: 13, color: 'rgba(187,247,208,0.4)', fontWeight: 500 }}>
              Catatin — IndonesiaNEXT × Telkomsel
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
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
