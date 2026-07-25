# Catatin

Aplikasi buat catat pengeluaran sehari-hari dengan cara yang lebih manusiawi — tulis aja bebas kayak chat, nanti sistem yang baca nominalnya, kategoriin sendiri, dan simpan ke dashboard.

Dibuat karena capek buka spreadsheet tiap mau catat jajan.

---

## Apa yang bisa dilakukan

- Tulis pengeluaran dalam kalimat bebas, misalnya `beli kopi 25rb tadi pagi` — langsung diproses
- Dashboard sederhana buat pantau pengeluaran per kategori
- Ada budget bulanan, kalau udah mau habis langsung kelihatan
- Insight mingguan singkat soal pola belanja
- Panel admin buat kelola user (karena daftar sendiri dimatiin)
- Rate limiting biar API-nya gak disalahgunain

---

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** — database, auth, dan RLS
- **Tailwind CSS v4**
- **Recharts** buat grafik
- **Python 3** — engine parsing AI-nya, jalan lokal, gak butuh API key

---

## Setup

### Yang dibutuhin dulu

- Node.js 18+
- Python 3.10+
- Akun Supabase (gratis)

### Clone dan install

```bash
git clone https://github.com/Yusepx007/catatin.git
cd catatin
npm install
```

### Isi environment variable

```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi ini:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

`SERVICE_ROLE_KEY` dibutuhin khusus buat endpoint admin. Jangan pernah di-commit ya.

### Setup database

Pergi ke SQL Editor di dashboard Supabase, copy-paste isi `supabase/schema.sql`, lalu jalankan.

Setelah itu, jadiin satu akun jadi admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'emailkamu@email.com';
```

### Jalanin

```bash
npm run dev
```

Buka `localhost:3000`.

---

## Soal AI-nya

Engine parsing-nya ditulis pakai Python murni di `ai/local_ai.py`. Gak pakai Gemini, GPT, atau API apapun — jadi gak ada biaya tambahan dan tetap jalan offline.

Cara kerjanya: teks dikirim ke script Python lewat subprocess, hasilnya dikembaliin dalam bentuk JSON ke Next.js.

Contoh kalau mau coba langsung dari terminal:

```bash
echo '{"rawText": "makan siang warteg 18rb kemarin"}' | python ai/local_ai.py parse
```

Output:

```json
{
  "category": "Makanan & Minuman",
  "amount": 18000,
  "transaction_date": "2026-07-24",
  "description": "Makan siang warteg"
}
```

Format nominal yang dipahami: `25rb`, `1.5jt`, `Rp 50.000`, angka biasa juga bisa.

Format tanggal: `kemarin`, `3 hari lalu`, `minggu lalu`, `24/07`, `2026-07-24`, `24 Juli`.

---

## Struktur folder

```
catatin/
├── ai/
│   └── local_ai.py              # script Python untuk parsing dan insight
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/           # endpoint kelola user
│   │   │   ├── parse-transaction/
│   │   │   └── weekly-insight/
│   │   ├── dashboard/
│   │   └── page.tsx             # halaman login/register
│   ├── components/
│   │   ├── AdminUserPanel.tsx
│   │   ├── BudgetCard.tsx
│   │   ├── CategoryChart.tsx
│   │   ├── ChatInput.tsx
│   │   ├── TransactionList.tsx
│   │   └── WeeklyInsight.tsx
│   └── lib/
│       ├── local-ai.ts          # jembatan Next.js ke Python
│       ├── rate-limit.ts
│       ├── server-auth.ts
│       └── supabase*.ts
└── supabase/
    └── schema.sql
```

---

## Database

Tiga tabel utama: `profiles` (user + role), `transactions`, dan `budgets`. Semua pakai Row Level Security — tiap user cuma bisa lihat dan ubah datanya sendiri.

---

## Scripts

```bash
npm run dev      # development
npm run build    # build production
npm run start    # jalanin production build
npm run lint     # lint
```

---

Proyek ini bagian dari **IndonesiaNEXT × Telkomsel**.
