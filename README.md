# Catatin

Aplikasi untuk mencatat pengeluaran harian dengan input seperti chat. Tulis bebas, aplikasi membaca nominal, kategori, tanggal, lalu menyimpan ke dashboard.

## Fitur

- Parsing transaksi dari kalimat bebas, misalnya `beli kopi 25rb tadi pagi`
- Dashboard pengeluaran per kategori
- Budget bulanan
- Insight mingguan
- Panel admin untuk tambah user
- Rate limiting untuk endpoint API

## Stack

- Next.js 16 App Router + TypeScript
- Supabase untuk auth, database, dan RLS
- Recharts untuk grafik
- AI rule-based TypeScript untuk Vercel
- Groq LLM API opsional untuk checklist hackathon
- Python AI tetap tersedia di folder `ai/` sebagai versi lokal/cadangan

## Setup Lokal

```bash
git clone https://github.com/Yusepx007/catatin.git
cd catatin
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Environment Variables

Salin `.env.example` ke `.env.local`, lalu isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-8b-instant
```

`SUPABASE_SERVICE_ROLE_KEY` hanya untuk server/admin endpoint. Jangan commit secret.
`GROQ_API_KEY` juga server-only, jadi cukup isi di `.env.local` atau Vercel Environment Variables.

## Setup Database

Jalankan isi `supabase/schema.sql` di Supabase SQL Editor.

Promosikan akun pertama menjadi admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'emailkamu@email.com';
```

## AI

AI utama untuk aplikasi ada di:

```text
src/lib/catatin-ai.ts
```

Ini yang dipakai Vercel, jadi tidak perlu Render, Google Cloud, atau hosting Python.

Kalau `GROQ_API_KEY` diisi, aplikasi akan mencoba Groq LLM API dulu. Kalau Groq limit, error, atau lambat, aplikasi otomatis fallback ke AI TypeScript bawaan.

File Python tetap dibiarkan di:

```text
ai/local_ai.py
```

Kalau mau tes Python manual:

```bash
echo '{"rawText": "makan siang warteg 18rb kemarin"}' | python ai/local_ai.py parse
```

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

Tidak perlu Render. Jika `GROQ_API_KEY` kosong, aplikasi tetap jalan memakai AI TypeScript bawaan.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Struktur Penting

```text
ai/local_ai.py              # Python AI cadangan
src/lib/catatin-ai.ts       # AI utama untuk Vercel
src/lib/local-ai.ts         # jembatan API Next.js ke AI utama/remote optional
src/app/api/                # endpoint API
src/components/             # komponen UI
supabase/schema.sql         # schema database dan RLS
```
