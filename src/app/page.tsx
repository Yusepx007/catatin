import Image from 'next/image';
import Link from 'next/link';

function IconArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 7.5h8.5M8.5 4.5l3 3-3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  { label: 'Input bebas seperti chat, tidak perlu isi form panjang' },
  { label: 'Kategori dan tanggal langsung dirapikan otomatis' },
  { label: 'Catat pemasukan & pengeluaran dalam satu tempat' },
  { label: 'Riwayat transaksi bisa diedit dan dipantau ulang' },
];

const mvpFeatures = [
  ['Tulis seperti ngobrol', 'Contoh: "bayar paylater 150rb" langsung jadi catatan.'],
  ['Catat pemasukan', 'Gaji, freelance, bonus—semua tercatat rapi sesuai kategori.'],
  ['Pantau budget', 'Progress pemakaian bulan ini terlihat tanpa hitung manual.'],
  ['Riwayat tetap rapi', 'Catatan bisa dicari, diedit, dan dihapus saat perlu.'],
];

const proofStats = [
  ['1 kalimat', 'untuk mencatat transaksi'],
  ['20 kategori', 'pengeluaran & pemasukan'],
  ['Realtime', 'dashboard langsung update'],
];

const demoSteps = [
  ['1', 'Tulis transaksi', 'beli bensin 10 ribu tadi pagi'],
  ['2', 'Catatin rapikan', 'Transportasi, Rp 10.000, hari ini'],
  ['3', 'Pantau hasilnya', 'Budget dan riwayat ikut berubah'],
];

const previewRows = [
  ['Transportasi', 'Rp 320.000', 'TR'],
  ['Makanan & Minuman', 'Rp 285.000', 'MK'],
  ['Paylater & Cicilan', 'Rp 150.000', 'PC'],
];

export default function HomePage() {
  return (
    <>
      {/* NAV */}
      <nav className="site-nav" style={{ background: 'rgba(4, 26, 18, 0.82)', borderBottomColor: 'rgba(134,239,172,0.1)' }}>
        <div className="site-nav-inner">
          <Link className="brand-lockup" href="/" aria-label="Catatin homepage">
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
              <p className="brand-title" style={{ color: 'white' }}>Catatin</p>
              <p style={{ color: 'rgba(187,247,208,0.72)', fontSize: 12 }}>Finance tracker berbasis AI</p>
            </div>
          </Link>

          <div className="nav-links">
            <a className="nav-link" href="#fitur" style={{ color: 'rgba(226,232,240,0.78)' }}>Fitur</a>
            <a className="nav-link" href="#alur" style={{ color: 'rgba(226,232,240,0.78)' }}>Alur</a>
            <Link className="btn-primary" href="/login" style={{ padding: '9px 14px', fontSize: 13 }}>
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — dark with bg image */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#041a12' }}>
        {/* Background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}>
          <Image
            src="/landing-bg.png"
            alt=""
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            quality={90}
          />
          {/* Overlay untuk readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(4,26,18,0.55) 0%, rgba(4,26,18,0.3) 40%, rgba(4,26,18,0.72) 100%)',
          }} />
        </div>

        <main className="landing-page" style={{ position: 'relative', zIndex: 1, paddingTop: 76 }}>
          <section className="landing-copy animate-fade-in-up" id="fitur">
            <div className="landing-hero-grid">
              <div className="landing-hero-content">
                <div className="landing-kicker" style={{
                  background: 'rgba(34,197,94,0.14)',
                  borderColor: 'rgba(134,239,172,0.22)',
                  color: '#86efac',
                }}>
                  <span className="status-dot" />
                  Finance tracker yang terasa ringan dipakai harian
                </div>

                <h1 className="landing-title" style={{ color: 'white' }}>
                  Catat keuangan cukup dengan satu kalimat.
                </h1>

                <p className="landing-lead" style={{ color: 'rgba(226,232,240,0.82)' }}>
                  Catatin bantu membaca nominal, kategori, dan tanggal dari tulisan bebas — baik
                  pengeluaran maupun pemasukan — lalu merangkumnya ke dashboard yang rapi.
                </p>

                <div className="landing-cta-row">
                  <Link className="btn-primary landing-main-cta" href="/register" style={{
                    boxShadow: '0 14px 40px rgba(34,197,94,0.35)',
                  }}>
                    Mulai catat gratis
                    <IconArrowRight />
                  </Link>
                  <a className="btn-secondary landing-secondary-cta" href="#alur" style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: 'rgba(226,232,240,0.9)',
                  }}>
                    Lihat alur demo
                  </a>
                </div>

                <div className="plain-feature-list">
                  {features.map((feature) => (
                    <div key={feature.label} className="plain-feature" style={{ color: 'rgba(226,232,240,0.78)' }}>
                      <div className="feature-check-icon">
                        <IconCheck />
                      </div>
                      <p>{feature.label}</p>
                    </div>
                  ))}
                </div>

                <div className="landing-proof-row" aria-label="Ringkasan kapabilitas Catatin">
                  {proofStats.map(([value, label]) => (
                    <div key={value} style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(134,239,172,0.15)' }}>
                      <strong style={{ color: 'white' }}>{value}</strong>
                      <span style={{ color: 'rgba(187,247,208,0.72)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product preview card */}
              <div className="landing-product-preview" aria-label="Preview Catatin" style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(134,239,172,0.15)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}>
                <div className="preview-topbar" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(134,239,172,0.14)' }}>
                  <div>
                    <span style={{ color: 'rgba(187,247,208,0.72)' }}>Dashboard bulan ini</span>
                    <strong style={{ color: 'white' }}>Rp 1.240.000</strong>
                  </div>
                  <span className="preview-pill">Aktif</span>
                </div>

                {/* Income + expense mini indicators */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <div style={{
                    flex: 1, padding: '8px 12px', borderRadius: 12,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(134,239,172,0.18)',
                  }}>
                    <p style={{ color: 'rgba(187,247,208,0.7)', fontSize: 10, marginBottom: 3 }}>PEMASUKAN</p>
                    <p style={{ color: '#86efac', fontWeight: 800, fontSize: 14 }}>+Rp 5.000.000</p>
                  </div>
                  <div style={{
                    flex: 1, padding: '8px 12px', borderRadius: 12,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(248,113,113,0.18)',
                  }}>
                    <p style={{ color: 'rgba(253,186,186,0.7)', fontSize: 10, marginBottom: 3 }}>PENGELUARAN</p>
                    <p style={{ color: '#fca5a5', fontWeight: 800, fontSize: 14 }}>-Rp 1.240.000</p>
                  </div>
                </div>

                <div className="preview-chat">
                  <div className="preview-bubble user">bayar paylater 150rb kemarin</div>
                  <div className="preview-bubble result" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span style={{ color: 'rgba(187,247,208,0.7)' }}>Transaksi terbaca</span>
                    <strong style={{ color: '#86efac' }}>Rp 150.000</strong>
                    <small style={{ color: 'rgba(226,232,240,0.6)' }}>Paylater & Cicilan - 31 Jul</small>
                  </div>
                </div>

                <div className="preview-budget" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(134,239,172,0.12)' }}>
                  <div>
                    <span style={{ color: 'rgba(187,247,208,0.7)' }}>Progress budget</span>
                    <strong style={{ color: 'white' }}>42%</strong>
                  </div>
                  <div className="preview-progress" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <span />
                  </div>
                </div>

                <div className="preview-list">
                  {previewRows.map(([name, amount, initials]) => (
                    <div key={name} style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span style={{ background: 'rgba(96,165,250,0.18)', borderColor: 'rgba(96,165,250,0.25)', color: '#93c5fd' }}>{initials}</span>
                      <p style={{ color: 'rgba(226,232,240,0.8)' }}>{name}</p>
                      <strong style={{ color: 'white' }}>{amount}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* CONTENT SECTIONS — light background */}
      <div style={{ background: '#f8fafc' }}>
        <div style={{ width: 'min(1180px, calc(100% - 32px))', margin: '0 auto', padding: '54px 0 44px' }}>

          {/* How it works */}
          <div id="alur" style={{ marginBottom: 56 }}>
            <div className="landing-section">
              <div className="section-heading">
                <p className="section-label">Alur penggunaan</p>
                <h2 style={{ marginTop: 10, maxWidth: 420, fontSize: 'clamp(1.55rem, 3vw, 2.2rem)', lineHeight: 1.24, letterSpacing: 0, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                  Dari catatan mentah jadi insight yang siap dibaca.
                </h2>
              </div>

              <div className="demo-step-grid">
                {demoSteps.map(([number, title, desc]) => (
                  <div key={number} className="demo-step-card">
                    <span>{number}</span>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ marginBottom: 48 }}>
            <div className="landing-section">
              <div className="section-heading">
                <p className="section-label">Fitur utama</p>
                <h2 style={{ marginTop: 10, maxWidth: 420, fontSize: 'clamp(1.55rem, 3vw, 2.2rem)', lineHeight: 1.24, letterSpacing: 0, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
                  Dibuat untuk orang yang ingin nyatet cepat, bukan ribet.
                </h2>
              </div>

              <div className="mvp-feature-grid" aria-label="Fitur MVP Catatin">
                {mvpFeatures.map(([title, desc]) => (
                  <div key={title} className="mvp-feature-card">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="powered-row">
            <div className="status-dot" />
            <span>Catatin AI</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>IndonesiaNEXT x Telkomsel</span>
          </div>
        </div>
      </div>

      <footer className="landing-footer" style={{ background: '#f8fafc' }}>
        <div>
          <span>Auth pengguna</span>
          <span>Parser transaksi</span>
          <span>Riwayat transaksi</span>
        </div>
      </footer>
    </>
  );
}
