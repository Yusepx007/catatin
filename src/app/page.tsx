import Image from 'next/image';
import Link from 'next/link';

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const features = [
  { label: 'Parsing otomatis dengan AI, cukup satu kalimat bebas' },
  { label: 'Dashboard dan grafik pengeluaran per kategori' },
  { label: 'Budget bulanan dengan progress yang mudah dipantau' },
  { label: 'Insight mingguan berbasis data transaksi nyata' },
];

const mvpFeatures = [
  ['Auth pengguna', 'Daftar dan login mandiri dengan Supabase Auth.'],
  ['AI parser transaksi', 'Input bebas seperti chat, nominal dan kategori langsung dibaca.'],
  ['Dashboard realtime', 'Ringkasan, grafik kategori, budget, dan insight mingguan.'],
  ['CRUD transaksi', 'Tambah, lihat, edit, dan hapus catatan pengeluaran.'],
];

export default function HomePage() {
  return (
    <>
      <nav className="site-nav">
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
              <p className="brand-title">Catatin</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Expense tracker berbasis AI</p>
            </div>
          </Link>

          <div className="nav-links">
            <a className="nav-link" href="#fitur">Fitur</a>
            <a className="nav-link" href="#alur">Alur</a>
            <Link className="nav-link" href="/login">Masuk</Link>
            <Link className="btn-primary" href="/register" style={{ padding: '9px 14px', fontSize: 13 }}>
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      <main className="landing-page">
        <section className="landing-copy animate-fade-in-up" id="fitur">
          <div style={{ width: '100%', maxWidth: 860 }}>
            <div style={{ marginBottom: 30 }}>
              <h1 className="landing-title">
                Catat pengeluaran
                <br />
                <span style={{ color: 'var(--text-secondary)' }}>lebih cepat, lebih rapi,</span>
                <br />
                <span className="gradient-text">tanpa ribet input manual.</span>
              </h1>

              <p className="landing-lead">
                Tulis pengeluaran seperti sedang chat. Catatin bantu membaca nominal, kategori, dan tanggal
                secara otomatis, lalu merangkum semuanya ke dashboard yang lebih enak dipantau.
              </p>
            </div>

            <div className="landing-cta-row">
              <Link className="btn-primary" href="/register">
                Mulai gratis
              </Link>
              <Link className="btn-secondary" href="/login">
                Masuk ke akun
              </Link>
            </div>

            <div className="plain-feature-list">
              {features.map((feature) => (
                <div key={feature.label} className="plain-feature">
                  <div className="feature-check-icon">
                    <IconCheck />
                  </div>
                  <p>{feature.label}</p>
                </div>
              ))}
            </div>

            <div id="alur" className="demo-flow">
              <strong>Alur demo:</strong>
              <span>Tulis transaksi</span>
              <span className="flow-arrow">→</span>
              <span>AI parse otomatis</span>
              <span className="flow-arrow">→</span>
              <span>Dashboard langsung update</span>
            </div>

            <div className="powered-row">
              <div className="status-dot" />
              <span>Powered by Catatin AI</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>IndonesiaNEXT x Telkomsel</span>
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
        </section>
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
