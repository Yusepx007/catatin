# Catatin

Catatin adalah aplikasi pencatat pengeluaran harian berbasis Next.js dan Supabase. Input pengeluaran ditulis seperti chat, lalu AI lokal berbasis Python membaca nominal, kategori, tanggal, dan deskripsi transaksi.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Salin `.env.example` ke `.env.local`, lalu isi:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` untuk endpoint admin

## AI lokal Python

Engine AI berada di `ai/local_ai.py` dan dipanggil oleh route API Next.js lewat `src/lib/local-ai.ts`.

Fitur yang sudah didukung:

- Parsing nominal seperti `25rb`, `1.5jt`, `Rp 25.000`, dan angka biasa.
- Tanggal relatif seperti `tadi pagi`, `kemarin`, `kemarin lusa`, `2 hari lalu`, dan `minggu lalu`.
- Kategori otomatis untuk makanan, transportasi, belanja, hiburan, kesehatan, pendidikan, tagihan, dan lainnya.
- Insight mingguan berbasis ringkasan transaksi.

Secara default aplikasi memakai command `python`. Jika perlu memakai binary lain, set environment variable:

```bash
PYTHON_BIN=python3
```

## API utama

- `POST /api/parse-transaction`
- `POST /api/weekly-insight`

Kedua endpoint tidak membutuhkan `GEMINI_API_KEY` karena sudah memakai AI lokal Python.

## Admin dan keamanan

Jalankan `supabase/schema.sql` di Supabase SQL Editor untuk membuat table `profiles`, role `admin/user`, trigger profile otomatis, dan RLS policy.

Setelah schema dijalankan, promote admin pertama:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email-admin@domain.com';
```

Untuk mode produksi yang lebih aman, matikan public signup di Supabase Dashboard, lalu buat user baru hanya dari panel admin di dashboard Catatin.

Perbaikan keamanan yang aktif:

- Endpoint AI wajib memakai bearer token session Supabase.
- Endpoint AI diberi rate limit per user.
- Endpoint admin hanya bisa dipakai role `admin`.
- Pembuatan user dilakukan server-side dengan `SUPABASE_SERVICE_ROLE_KEY`, tidak dari browser.
- RLS membatasi transaksi dan budget ke pemilik datanya.
