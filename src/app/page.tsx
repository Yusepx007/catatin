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
  { label: 'Budget bulanan terlihat jelas sejak layar pertama' },
  { label: 'Riwayat transaksi bisa diedit dan dipantau ulang' },
];

const mvpFeatures = [
  ['Tulis seperti ngobrol', 'Contoh: "bayar paylater 150rb" langsung jadi catatan.'],
  ['Pantau budget', 'Progress pemakaian bulan ini terlihat tanpa hitung manual.'],
  ['Pola belanja terbaca', 'Kategori terbesar dan rata-rata transaksi mudah dilihat.'],
  ['Riwayat tetap rapi', 'Catatan bisa dicari, diedit, dan dihapus saat perlu.'],
];

const proofStats = [
  ['1 kalimat', 'untuk mencatat transaksi'],
  ['12 kategori', 'pengeluaran harian'],
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
            <Link className="btn-primary" href="/login" style={{ padding: '9px 14px', fontSize: 13 }}>
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </nav>

      <main className="landing-page">
        <section className="landing-copy animate-fade-in-up" id="fitur">
          <div className="landing-hero-grid">
            <div className="landing-hero-content">
              <div className="landing-kicker">
                <span className="status-dot" />
                Catatan keuangan yang terasa ringan dipakai harian
              </div>

              <h1 className="landing-title">
                Catat pengeluaran cukup dengan satu kalimat.
              </h1>

              <p className="landing-lead">
                Catatin bantu membaca nominal, kategori, dan tanggal dari tulisan bebas,
                lalu merangkumnya ke dashboard yang rapi untuk dipantau setiap hari.
              </p>

              <div className="landing-cta-row">
                <Link className="btn-primary landing-main-cta" href="/register">
                  Mulai catat gratis
                  <IconArrowRight />
                </Link>
                <a className="btn-secondary landing-secondary-cta" href="#alur">
                  Lihat alur demo
                </a>
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

              <div className="landing-proof-row" aria-label="Ringkasan kapabilitas Catatin">
                {proofStats.map(([value, label]) => (
                  <div key={value}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-product-preview" aria-label="Preview Catatin">
              <div className="preview-topbar">
                <div>
                  <span>Dashboard bulan ini</span>
                  <strong>Rp 1.240.000</strong>
                </div>
                <span className="preview-pill">Aktif</span>
              </div>

              <div className="preview-chat">
                <div className="preview-bubble user">bayar paylater 150rb kemarin</div>
                <div className="preview-bubble result">
                  <span>Transaksi terbaca</span>
                  <strong>Rp 150.000</strong>
                  <small>Paylater & Cicilan - 31 Jul</small>
                </div>
              </div>

              <div className="preview-budget">
                <div>
                  <span>Progress budget</span>
                  <strong>42%</strong>
                </div>
                <div className="preview-progress">
                  <span />
                </div>
              </div>

              <div className="preview-list">
                {previewRows.map(([name, amount, initials]) => (
                  <div key={name}>
                    <span>{initials}</span>
                    <p>{name}</p>
                    <strong>{amount}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="alur" className="landing-section">
            <div className="section-heading">
              <p className="section-label">Alur penggunaan</p>
              <h2>Dari catatan mentah jadi insight yang siap dibaca.</h2>
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

          <div className="landing-section">
            <div className="section-heading">
              <p className="section-label">Fitur utama</p>
              <h2>Dibuat untuk orang yang ingin nyatet cepat, bukan ribet.</h2>
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

          <div className="powered-row">
            <div className="status-dot" />
            <span>Catatin AI</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>IndonesiaNEXT x Telkomsel</span>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div>
          <span>Auth pengguna</span>
          <span>Parser transaksi</span>
          <span>Riwayat transaksi</span>
        </div>
      </footer>
    </>
  );
}
