# PRD: Catatin — Catatan Keuangan via Chat

## 1. Ringkasan
Catatin adalah aplikasi pencatat pengeluaran yang memungkinkan pengguna mencatat transaksi dengan mengetik kalimat bebas (natural language), bukan mengisi form manual. Sistem menggunakan LLM untuk mem-parsing teks menjadi data terstruktur (kategori, nominal, tanggal, deskripsi), menyimpannya ke database, lalu menampilkan ringkasan, insight mingguan, dan peringatan pola belanja.

Dibuat untuk Hackathon Individu IndonesiaNEXT x Telkomsel, tema **Literasi Finansial**, role **Hacker**.

- **Live URL:** https://catatin-flax.vercel.app/
- **Repository:** https://github.com/Yusepx007/catatin

## 2. Latar Belakang Masalah
Banyak orang — terutama mahasiswa dengan uang bulanan/uang saku terbatas — tahu bahwa mencatat pengeluaran itu penting untuk mengelola keuangan, tapi jarang konsisten melakukannya karena form pencatatan manual (pilih kategori dari dropdown, isi tanggal, isi nominal satu per satu) terasa merepotkan dan memakan waktu.

Akibatnya, banyak yang baru sadar uang habis setelah kejadian, bukan sebelum kejadian.

## 3. Target Pengguna
Mahasiswa kos/rantau dengan uang bulanan tetap (kiriman orang tua atau uang saku bulanan), yang butuh cara cepat mencatat pengeluaran harian tanpa proses ribet.

## 4. Tujuan Produk
- Menurunkan friksi pencatatan pengeluaran hingga hanya perlu satu kalimat bebas
- Memberi peringatan dini jika pola belanja berisiko membuat uang habis sebelum akhir bulan
- Memberi insight sederhana yang mendorong kebiasaan finansial lebih sehat

## 5. Fitur MVP (Sesuai Implementasi)

### 5.1 Input Transaksi via Chat
- Pengguna login lalu mengetik pengeluaran dalam kalimat bebas, contoh: "beli kopi 25rb tadi pagi"
- Input disanitasi (strip tag HTML, batasi panjang karakter) sebelum diproses
- Teks dikirim ke **Groq LLM API** (`llama-3.1-8b-instant`) untuk diparsing menjadi kategori, nominal, tanggal, dan deskripsi singkat
- Jika Groq gagal, timeout, atau limit, sistem otomatis **fallback ke parser rule-based TypeScript bawaan** (`src/lib/catatin-ai.ts`) agar pencatatan tetap bisa jalan
- Endpoint dibatasi rate limit (30 request/menit per user) untuk mencegah penyalahgunaan

### 5.2 Penyimpanan Transaksi
- Data transaksi tersimpan di Supabase, tabel `transactions`
- Row Level Security (RLS) aktif — setiap user hanya bisa melihat, menambah, dan menghapus transaksi miliknya sendiri

### 5.3 Autentikasi & Profil Pengguna
- Pengguna baru bisa mendaftar sendiri lewat halaman login (Supabase Auth)
- Setiap user otomatis mendapat baris di tabel `profiles` dengan role default `user`
- Tersedia panel admin terbatas (role `admin`) untuk melihat daftar user — di luar alur utama pengguna biasa

### 5.4 Dashboard Ringkasan
- Daftar transaksi terbaru
- Grafik pengeluaran per kategori (menggunakan Recharts)
- Status budget bulanan berjalan

### 5.5 Budget & Peringatan Pola Belanja
- Pengguna menentukan batas budget bulanan (tabel `budgets`, default Rp1.000.000 per bulan)
- Sistem membandingkan pengeluaran berjalan terhadap budget untuk memberi peringatan dini

### 5.6 Insight Mingguan dari LLM
- Groq (dengan fallback rule-based) menghasilkan satu kalimat insight dari data transaksi minggu berjalan, contoh: "Pengeluaran F&B kamu naik 20% dari minggu lalu"

## 6. Di Luar Ruang Lingkup (Out of Scope)
- Multi-akun keluarga / berbagi budget
- Integrasi rekening bank / e-wallet otomatis
- Notifikasi push / reminder terjadwal
- Export laporan PDF/Excel

## 7. Tech Stack
| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Database, Auth & RLS | Supabase |
| LLM API | Groq API (`llama-3.1-8b-instant`), dengan fallback rule-based TypeScript |
| Visualisasi | Recharts |
| Deployment | Vercel |
| Version Control | GitHub |

## 8. Model Data (Sesuai `supabase/schema.sql`)

**Tabel `profiles`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| user_id | uuid | primary key, relasi ke auth.users |
| email | text | email pengguna |
| role | text | `user` atau `admin`, default `user` |
| created_at | timestamptz | waktu akun dibuat |

**Tabel `transactions`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | relasi ke auth.users |
| raw_text | text | input asli dari pengguna |
| category | text | hasil parsing LLM/rule-based |
| amount | numeric(15,2) | nominal transaksi |
| transaction_date | date | tanggal transaksi |
| description | text | deskripsi singkat hasil parsing |
| created_at | timestamptz | waktu pencatatan |

**Tabel `budgets`**
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | relasi ke auth.users |
| monthly_limit | numeric(15,2) | batas budget bulanan, default 1.000.000 |
| month | text | periode budget, format YYYY-MM |
| created_at | timestamptz | waktu dibuat |

Semua tabel diproteksi Row Level Security: pengguna hanya bisa mengakses datanya sendiri; akses lintas-user hanya untuk role `admin` pada tabel `profiles`.

## 9. Alur Pengguna (User Flow)
1. Pengguna mendaftar/login lewat Supabase Auth
2. Pengguna mengetik pengeluaran di kolom chat input
3. Sistem memanggil Groq API untuk parsing (fallback ke rule-based jika perlu)
4. Hasil parsing tervalidasi lalu disimpan ke tabel `transactions`
5. Dashboard otomatis ter-update: daftar transaksi, grafik kategori, status budget
6. Sistem menampilkan peringatan jika pengeluaran mendekati/melebihi budget bulanan
7. Insight mingguan ditampilkan berdasarkan akumulasi transaksi

## 10. Metrik Keberhasilan (untuk Demo)
- Parsing LLM (Groq) berhasil mengekstrak kategori, nominal, dan tanggal dengan benar dari input bebas
- Fallback rule-based tetap menghasilkan data valid saat Groq tidak tersedia
- Dashboard menampilkan data real-time setelah input baru
- Peringatan budget dan insight mingguan muncul dengan logika yang masuk akal
- Aplikasi dapat diakses via URL publik tanpa error saat demo

## 11. Batasan & Risiko
- Akurasi parsing Groq bergantung pada kejelasan prompt — sudah diuji dengan berbagai variasi kalimat, namun kasus tepi (edge case) tetap mungkin meleset
- Free tier Groq API memiliki batas rate limit — mitigasi lewat fallback otomatis ke rule-based TypeScript
- `GROQ_API_KEY` wajib diisi di Environment Variables Vercel agar parsing memakai LLM sungguhan, bukan hanya rule-based
- Proyeksi budget menggunakan perhitungan sederhana, bukan model prediksi kompleks — cukup untuk skala MVP hackathon
