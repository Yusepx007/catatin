# Catatin

Aplikasi untuk mencatat pengeluaran dan pemasukan harian dengan input seperti chat. Tulis bebas, aplikasi membaca nominal, kategori, tanggal, lalu menyimpan ke dashboard.

> Dibuat oleh **Yusep** · [@yusepx007](https://instagram.com/yusepx007)

---

## Fitur

- **Input natural language** — tulis bebas seperti `beli kopi 25rb tadi pagi`, langsung diparsing
- **Catat pemasukan** — mode pemasukan dengan 8 kategori: Gaji, Freelance, Bisnis, Investasi, Bonus, Hadiah, Penjualan, dan lainnya
- **Catat pengeluaran** — 12 kategori otomatis: Makanan, Transportasi, Belanja, dll
- **Saldo bersih** — dashboard otomatis hitung pemasukan − pengeluaran per bulan
- **Budget bulanan** — pantau progress pengeluaran vs limit yang kamu set
- **Riwayat & Analitik** — edit, hapus, dan lihat grafik per kategori
- **Insight mingguan AI** — ringkasan pola keuangan 7 hari terakhir
- **Export Excel** — unduh transaksi bulanan ke file `.xls`
- **Admin panel** — manajemen user untuk akun admin
- **Rate limiting** — proteksi endpoint API dari abuse

---

## Stack

- **Next.js 16** App Router + TypeScript
- **Supabase** untuk auth, database, dan Row Level Security
- **Recharts** untuk grafik analitik
- **Groq LLM API** (opsional) — fallback ke AI rule-based TypeScript jika tidak diisi
- **Tailwind CSS v4**

---

## Setup Lokal

```bash
git clone https://github.com/Yusepx007/catatin.git
cd catatin
npm install
npm run dev
```

Buka `http://localhost:3000`.

---

## Environment Variables

Salin `.env.example` ke `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

- `SUPABASE_SERVICE_ROLE_KEY` — server/admin only, jangan commit
- `GROQ_API_KEY` — server-only, isi di `.env.local` atau Vercel Environment Variables

---

## Setup Database

Jalankan isi `supabase/schema.sql` di Supabase SQL Editor.

> ⚠️ **Penting:** Schema terbaru menambah kolom `type` (`expense` | `income`) ke tabel `transactions`. Pastikan jalankan ulang schema jika sudah punya tabel lama.

User baru bisa daftar sendiri dari halaman login. Secara default akun baru punya role `user`.

Untuk promosikan akun admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'emailkamu@email.com';
```

---

## Fitur Pemasukan (Income)

Sejak update terbaru, Catatin mendukung pencatatan **pemasukan** selain pengeluaran:

- Di halaman **Catat**, toggle tab antara *Pengeluaran* dan *Pemasukan*
- Kategori pemasukan: Gaji & Upah, Freelance & Proyek, Bisnis, Investasi, Bonus & THR, Hadiah & Hibah, Penjualan, Pendapatan Lainnya
- Riwayat menampilkan income dengan warna hijau dan prefix `+Rp`
- Dashboard menampilkan **saldo bersih** (pemasukan − pengeluaran)

---

## AI

AI utama untuk aplikasi ada di:

```text
src/lib/catatin-ai.ts
```

Dipakai di Vercel — tidak perlu Render, Google Cloud, atau hosting Python.

Jika `GROQ_API_KEY` diisi, aplikasi akan mencoba Groq LLM API dulu. Jika Groq limit, error, atau lambat, aplikasi otomatis fallback ke AI TypeScript bawaan.

---

## Deploy ke Vercel

Deploy repo ini langsung ke Vercel sebagai Next.js app.

Isi Environment Variables di Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://domain-vercel-kamu.vercel.app
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

Jika `GROQ_API_KEY` kosong, aplikasi tetap berjalan menggunakan AI TypeScript bawaan.

---

## Scripts

```bash
npm run dev       # development server
npm run build     # production build
npm run start     # jalankan production build
npm run lint      # lint check
```

---

## Struktur Penting

```text
src/lib/catatin-ai.ts       # AI utama rule-based TypeScript
src/lib/local-ai.ts         # jembatan Next.js API ke Groq/fallback AI
src/lib/categories.ts       # kategori pengeluaran & pemasukan
src/app/api/                # endpoint API (parse-transaction, weekly-insight, admin)
src/components/             # komponen UI (ChatInput, TransactionList, BudgetCard, dll)
src/app/dashboard/          # halaman dashboard utama
supabase/schema.sql         # schema database, RLS, dan migrasi kolom type
public/landing-bg.png       # background hero landing page
```

---

## Changelog Terbaru

| Versi | Perubahan |
|-------|-----------|
| latest | Redesign landing page — dark theme profesional, hero split layout |
| latest | Fitur pemasukan (income) — toggle mode, 8 kategori, saldo bersih |
| latest | Fix bug tab mode ChatInput spam pesan |
| latest | Update branding — dibuat oleh Yusep (@yusepx007) |
