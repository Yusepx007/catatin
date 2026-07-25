# 📒 Catatin

> **Catat pengeluaran lebih cepat, lebih rapi, tanpa ribet input manual.**

Catatin adalah aplikasi pencatat keuangan personal berbasis web yang memungkinkan kamu mencatat pengeluaran hanya dengan menulis kalimat bebas — seperti sedang chat. AI lokal bawaan akan otomatis membaca nominal, kategori, dan tanggal dari teks tersebut, lalu menyimpannya ke dashboard yang rapi dan mudah dipantau.

---

## ✨ Fitur Utama

- **🤖 Parsing AI Otomatis** — Cukup tulis `"beli kopi 25rb tadi pagi"`, sisanya dikerjakan AI
- **📊 Dashboard & Grafik** — Visualisasi pengeluaran per kategori menggunakan Recharts
- **💰 Budget Monitor** — Pantau limit budget bulanan dan dapatkan warning dini
- **📈 Weekly Insight** — Analisis pola pengeluaran mingguan berbasis data nyata
- **🛡️ Admin Panel** — Kelola pengguna dari dashboard khusus admin
- **🔒 Auth Aman** — Login/register via Supabase Auth dengan Row Level Security
- **⚡ Rate Limiting** — Proteksi API dari penyalahgunaan
- **🐍 Local AI (Python)** — Tidak bergantung pada API eksternal berbayar

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript, Python 3 |
| Styling | Tailwind CSS v4 |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| Charts | [Recharts](https://recharts.org/) |
| AI Engine | Python (local, zero external API) |
| Icons | [Lucide React](https://lucide.dev/) |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat

- Node.js 18+
- Python 3.10+
- Akun [Supabase](https://supabase.com/) (gratis)

### 1. Clone & Install

```bash
git clone https://github.com/Yusepx007/catatin.git
cd catatin
npm install
```

### 2. Setup Environment Variables

Salin file contoh lalu isi dengan nilai milikmu:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key

# Server-only. Dibutuhkan untuk endpoint admin (buat/kelola user).
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ Jangan pernah commit `.env.local` ke repository. File ini sudah ada di `.gitignore`.

### 3. Setup Database Supabase

Buka **SQL Editor** di dashboard Supabase-mu, lalu jalankan seluruh isi file:

```
supabase/schema.sql
```

Setelah schema dijalankan, jadikan akun pertama sebagai admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'emailkamu@contoh.com';
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🤖 Cara Kerja Local AI

Catatin menggunakan script Python murni (`ai/local_ai.py`) sebagai engine AI — **tanpa API key, tanpa biaya, tanpa koneksi internet**.

### Perintah yang Didukung

**Parse transaksi** — menerima teks bebas dari stdin:
```bash
echo '{"rawText": "makan siang 35rb kemarin"}' | python ai/local_ai.py parse
```

Output:
```json
{
  "category": "Makanan & Minuman",
  "amount": 35000,
  "transaction_date": "2026-07-24",
  "description": "Makan siang"
}
```

**Generate weekly insight** — menerima array transaksi:
```bash
echo '{"transactions": [...]}' | python ai/local_ai.py insight
```

### Format Teks yang Didukung

| Jenis Input | Contoh |
|---|---|
| Nominal + satuan | `25rb`, `1.5jt`, `Rp 50.000` |
| Tanggal relatif | `tadi pagi`, `kemarin`, `3 hari lalu`, `minggu lalu` |
| Tanggal absolut | `24/07`, `2026-07-24`, `24 Juli` |
| Kategori otomatis | kopi → Makanan, grab → Transportasi, listrik → Tagihan |

### Kategori yang Dikenali

`Makanan & Minuman` · `Transportasi` · `Belanja` · `Hiburan` · `Kesehatan` · `Pendidikan` · `Tagihan & Utilitas` · `Lainnya`

---

## 🗄️ Struktur Database

```
profiles          → data user dan role (admin/user)
transactions      → riwayat transaksi per user
budgets           → limit budget bulanan per user
```

Semua tabel menggunakan **Row Level Security (RLS)** — setiap user hanya bisa mengakses datanya sendiri. Admin memiliki akses tambahan melalui endpoint server dengan service role.

---

## 📁 Struktur Proyek

```
catatin/
├── ai/
│   └── local_ai.py          # Python AI engine (parse & insight)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/       # Endpoint admin (users, me)
│   │   │   ├── parse-transaction/  # API parsing transaksi
│   │   │   └── weekly-insight/     # API insight mingguan
│   │   ├── auth/            # Halaman callback auth
│   │   ├── dashboard/       # Halaman dashboard utama
│   │   └── page.tsx         # Landing + form login/register
│   ├── components/
│   │   ├── AdminUserPanel.tsx
│   │   ├── BudgetCard.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── ChatInput.tsx    # Input transaksi gaya chat
│   │   ├── TransactionList.tsx
│   │   └── WeeklyInsight.tsx
│   └── lib/
│       ├── local-ai.ts      # Bridge Next.js → Python subprocess
│       ├── rate-limit.ts    # Rate limiter untuk API
│       ├── server-auth.ts   # Helper auth server-side
│       ├── supabase-admin.ts
│       ├── supabase-server.ts
│       └── supabase.ts
├── supabase/
│   └── schema.sql           # Schema & RLS policies lengkap
├── .env.example             # Template variabel lingkungan
└── .gitignore
```

---

## 🧑‍💼 Manajemen Admin

1. Login sebagai admin ke dashboard
2. Buka halaman **Admin Panel** (hanya muncul untuk role admin)
3. Dari sana kamu bisa melihat daftar semua pengguna terdaftar

Untuk membuat akun pengguna baru, akun baru hanya bisa dibuat melalui panel admin (pendaftaran mandiri dinonaktifkan secara default).

---

## 📜 Scripts

```bash
npm run dev      # Jalankan dev server (http://localhost:3000)
npm run build    # Build production
npm run start    # Jalankan production build
npm run lint     # Lint kode
```

---

## 🤝 Kontribusi

Pull request dan issue sangat terbuka! Beberapa area yang bisa dikembangkan:

- Export data ke CSV/Excel
- Notifikasi push ketika mendekati limit budget
- Multi-currency support
- Integrasi dengan dompet digital (GoPay, OVO, dll.)

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **IndonesiaNEXT × Telkomsel**. Hubungi pemilik repository untuk informasi lisensi lebih lanjut.

---

<div align="center">
  <sub>Dibuat dengan ☕ oleh <a href="https://github.com/Yusepx007">Yusepx007</a></sub>
</div>
