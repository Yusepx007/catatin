-- ══════════════════════════════════════════════════════════════════════
-- CATATIN — Demo Account "Alex" Seed Data
--
-- LANGKAH LENGKAP:
--
-- STEP 1: Daftar akun demo Alex dulu di aplikasi
--   → Buka https://catatin.vercel.app (atau localhost:3000)
--   → Klik "Daftar" / Register
--   → Email    : alex@catatin.demo
--   → Password : Alex@demo2024
--   → Nama     : Alex
--
-- STEP 2: Ambil user_id Alex
--   → Buka Supabase Dashboard
--   → Authentication → Users
--   → Cari alex@catatin.demo → copy UUID nya
--
-- STEP 3: Paste UUID di bawah lalu jalankan di SQL Editor
-- ══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  uid TEXT := '5be48978-69e3-46a5-8bac-5211e6e08a14';  -- UUID Alex

  y  INT := EXTRACT(YEAR  FROM CURRENT_DATE)::INT;
  m  INT := EXTRACT(MONTH FROM CURRENT_DATE)::INT;

  m0 TEXT; m1 TEXT; m2 TEXT; m3 TEXT; m4 TEXT;

BEGIN

  -- UUID Alex sudah benar: 5be48978-69e3-46a5-8bac-5211e6e08a14

  m0 := TO_CHAR(MAKE_DATE(y, m,   1), 'YYYY-MM');
  m1 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '1 month',  'YYYY-MM');
  m2 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '2 months', 'YYYY-MM');
  m3 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '3 months', 'YYYY-MM');
  m4 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '4 months', 'YYYY-MM');


  -- ── BUDGETS ─────────────────────────────────────────────────────────
  INSERT INTO public.budgets (user_id, month, monthly_limit) VALUES
    (uid, m0, 5000000),
    (uid, m1, 5000000),
    (uid, m2, 4500000),
    (uid, m3, 4500000),
    (uid, m4, 4000000)
  ON CONFLICT (user_id, month) DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit;

  -- ══ BULAN INI ══════════════════════════════════════════════════════

  INSERT INTO public.transactions (user_id, type, category, description, amount, transaction_date, raw_text) VALUES

  -- Pemasukan
  (uid,'income','Gaji & Upah',       'Gaji bulan ini PT Kreasi Digital',  6000000, m0||'-01','gaji 6jt'),
  (uid,'income','Freelance & Proyek','Desain UI mobile app startup',       1500000, m0||'-06','freelance ui 1.5jt'),
  (uid,'income','Investasi',         'Return reksadana Bibit bulan ini',    180000, m0||'-14','return reksadana 180rb'),

  -- Makanan
  (uid,'expense','Makanan & Minuman','Nasi padang komplit kantin',          28000, m0||'-02','nasi padang 28rb'),
  (uid,'expense','Makanan & Minuman','Grocery Alfamart mingguan',          165000, m0||'-04','alfamart 165rb'),
  (uid,'expense','Makanan & Minuman','Kopi Fore Coffee 5x seminggu',        87500, m0||'-06','fore coffee 87.5rb'),
  (uid,'expense','Makanan & Minuman','Makan malam Jepang bersama teman',   145000, m0||'-09','ramen jepang 145rb'),
  (uid,'expense','Makanan & Minuman','GrabFood delivery weekend',           78000, m0||'-12','grabfood 78rb'),
  (uid,'expense','Makanan & Minuman','Snack & minuman WFH',                 42000, m0||'-15','snack wfh 42rb'),

  -- Transport
  (uid,'expense','Transportasi','Token KRL Jakarta bulan ini',            100000, m0||'-01','krl 100rb'),
  (uid,'expense','Transportasi','Ojek online harian 5 hari',               90000, m0||'-05','ojek 90rb'),
  (uid,'expense','Transportasi','Bensin Pertamax full tank motor',          70000, m0||'-10','bensin 70rb'),

  -- Tagihan
  (uid,'expense','Tagihan & Utilitas','Listrik PLN bulan ini',             295000, m0||'-05','listrik 295rb'),
  (uid,'expense','Tagihan & Utilitas','IndiHome internet + TV',            350000, m0||'-05','indihome 350rb'),
  (uid,'expense','Tagihan & Utilitas','Pulsa Telkomsel 30 hari',            50000, m0||'-03','pulsa 50rb'),

  -- Belanja
  (uid,'expense','Belanja','Kemeja kerja Brand Local 2 pcs',              298000, m0||'-08','kemeja 298rb'),
  (uid,'expense','Belanja','Mouse wireless Logitech M331',                 199000, m0||'-13','mouse 199rb'),

  -- Hiburan
  (uid,'expense','Hiburan','Netflix Premium bulan ini',                     54000, m0||'-01','netflix 54rb'),
  (uid,'expense','Hiburan','Spotify Premium',                               54990, m0||'-01','spotify 55rb'),
  (uid,'expense','Hiburan','Nonton Bioskop XXI 2 tiket',                    80000, m0||'-11','xxl 2 tiket 80rb'),

  -- Lainnya
  (uid,'expense','Kesehatan',       'Vitamin C + Zinc suplemen',            48000, m0||'-04','vitamin 48rb'),
  (uid,'expense','Paylater & Cicilan','Cicilan laptop Shopee 12x',         450000, m0||'-15','cicilan laptop 450rb'),
  (uid,'expense','Perawatan Diri',  'Barbershop + cuci motor',              65000, m0||'-08','barber 65rb'),
  (uid,'expense','Donasi & Sosial', 'Infaq masjid + sedekah online',        30000, m0||'-07','infaq 30rb');

  -- ══ 1 BULAN LALU ═══════════════════════════════════════════════════

  INSERT INTO public.transactions (user_id, type, category, description, amount, transaction_date, raw_text) VALUES

  (uid,'income','Gaji & Upah',        'Gaji PT Kreasi Digital',            6000000, m1||'-01','gaji 6jt'),
  (uid,'income','Freelance & Proyek', 'Website company profile UMKM',      2000000, m1||'-18','freelance web 2jt'),
  (uid,'income','Investasi',          'Dividen saham BBCA Q1',              210000, m1||'-20','dividen 210rb'),

  (uid,'expense','Makanan & Minuman','Grocery bulanan Giant',              420000, m1||'-03','giant 420rb'),
  (uid,'expense','Makanan & Minuman','Team lunch restoran padang',         230000, m1||'-12','makan tim 230rb'),
  (uid,'expense','Makanan & Minuman','Kopi harian 4 minggu',               140000, m1||'-28','kopi harian 140rb'),
  (uid,'expense','Makanan & Minuman','GrabFood 5x delivery',               125000, m1||'-22','grabfood 125rb'),
  (uid,'expense','Makanan & Minuman','Sarapan warteg sebulan (5 hari/mg)', 200000, m1||'-25','warteg 200rb'),

  (uid,'expense','Transportasi',     'KRL bulanan',                        100000, m1||'-01','krl 100rb'),
  (uid,'expense','Transportasi',     'Ojek online 4 minggu',               160000, m1||'-28','ojek 160rb'),
  (uid,'expense','Transportasi',     'Bensin motor 2x isi full',           135000, m1||'-14','bensin 135rb'),

  (uid,'expense','Tagihan & Utilitas','Listrik PLN',                       280000, m1||'-05','listrik 280rb'),
  (uid,'expense','Tagihan & Utilitas','IndiHome',                          350000, m1||'-05','indihome 350rb'),
  (uid,'expense','Tagihan & Utilitas','Pulsa',                              50000, m1||'-04','pulsa 50rb'),

  (uid,'expense','Belanja',          'Sepatu Specs olahraga',              399000, m1||'-16','sepatu specs 399rb'),
  (uid,'expense','Belanja',          'Buku Rich Dad Poor Dad',              89000, m1||'-20','buku 89rb'),

  (uid,'expense','Hiburan',          'Netflix',                             54000, m1||'-01','netflix 54rb'),
  (uid,'expense','Hiburan',          'Spotify',                             54990, m1||'-01','spotify 55rb'),
  (uid,'expense','Hiburan',          'Karaoke + makan 4 orang',            320000, m1||'-25','karaoke 320rb'),

  (uid,'expense','Kesehatan',        'Periksa dokter + obat demam',        175000, m1||'-09','dokter 175rb'),
  (uid,'expense','Paylater & Cicilan','Cicilan laptop Shopee',             450000, m1||'-15','cicilan 450rb'),
  (uid,'expense','Perawatan Diri',   'Skincare Somethinc sebulan',         120000, m1||'-18','skincare 120rb'),
  (uid,'expense','Donasi & Sosial',  'Sumbang nikahan teman SMA',          300000, m1||'-22','amplop nikah 300rb'),
  (uid,'expense','Rumah Tangga',     'Alat dapur + deterjen',               88000, m1||'-10','rumah tangga 88rb');

  -- ══ 2 BULAN LALU ═══════════════════════════════════════════════════

  INSERT INTO public.transactions (user_id, type, category, description, amount, transaction_date, raw_text) VALUES

  (uid,'income','Gaji & Upah',        'Gaji PT Kreasi Digital',            6000000, m2||'-01','gaji 6jt'),
  (uid,'income','Freelance & Proyek', 'Ilustrasi konten sosmed brand',      800000, m2||'-10','freelance ilustrasi 800rb'),
  (uid,'income','Penjualan',          'Jual laptop lama di OLX',           3500000, m2||'-15','jual laptop 3.5jt'),

  (uid,'expense','Makanan & Minuman','Grocery mingguan x4',                360000, m2||'-28','grocery 360rb'),
  (uid,'expense','Makanan & Minuman','Makan malam Japanese ramen',         155000, m2||'-14','ramen 155rb'),
  (uid,'expense','Makanan & Minuman','Kopi & camilan WFH 2 minggu',         95000, m2||'-20','kopi wfh 95rb'),
  (uid,'expense','Makanan & Minuman','Food delivery GrabFood',              110000, m2||'-24','grabfood 110rb'),

  (uid,'expense','Transportasi',     'KRL bulanan',                        100000, m2||'-01','krl 100rb'),
  (uid,'expense','Transportasi',     'Bensin full tank 2x',                135000, m2||'-15','bensin 135rb'),
  (uid,'expense','Transportasi',     'Uber airport jemput teman',           95000, m2||'-27','uber airport 95rb'),

  (uid,'expense','Tagihan & Utilitas','Listrik PLN',                       275000, m2||'-05','listrik 275rb'),
  (uid,'expense','Tagihan & Utilitas','IndiHome',                          350000, m2||'-05','indihome 350rb'),
  (uid,'expense','Tagihan & Utilitas','Pulsa + paket data extra',           80000, m2||'-04','pulsa paket 80rb'),

  (uid,'expense','Belanja',          'Monitor 24" second murah Tokped',   1200000, m2||'-08','monitor 1.2jt'),
  (uid,'expense','Belanja',          'Keyboard mechanical Rexus',          350000, m2||'-08','keyboard 350rb'),

  (uid,'expense','Hiburan',          'Netflix + Spotify',                  108990, m2||'-01','streaming 109rb'),
  (uid,'expense','Hiburan',          'Tiket konser Dewa 19 tribute',       350000, m2||'-19','konser 350rb'),

  (uid,'expense','Paylater & Cicilan','Cicilan laptop Shopee',             450000, m2||'-15','cicilan 450rb'),
  (uid,'expense','Pendidikan',       'Kursus UI/UX Udemy 3 course',        250000, m2||'-06','udemy 250rb'),
  (uid,'expense','Kesehatan',        'Vitamin & suplemen bulanan',          85000, m2||'-05','vitamin 85rb'),
  (uid,'expense','Perawatan Diri',   'Potong rambut + hair treatment',      90000, m2||'-12','hair treatment 90rb'),
  (uid,'expense','Donasi & Sosial',  'Infaq & donasi online',               50000, m2||'-14','infaq 50rb');

  -- ══ 3 BULAN LALU (BULAN LEBARAN) ═══════════════════════════════════

  INSERT INTO public.transactions (user_id, type, category, description, amount, transaction_date, raw_text) VALUES

  (uid,'income','Gaji & Upah',    'Gaji PT Kreasi Digital',               6000000, m3||'-01','gaji 6jt'),
  (uid,'income','Bonus & THR',    'THR dari kantor 1x gaji',              6000000, m3||'-12','thr 6jt'),
  (uid,'income','Hadiah & Hibah', 'Angpao Lebaran dari keluarga besar',    950000, m3||'-20','angpao 950rb'),

  (uid,'expense','Makanan & Minuman','Belanja Lebaran bahan makanan',      680000, m3||'-08','belanja lebaran 680rb'),
  (uid,'expense','Makanan & Minuman','Opor, ketupat, rendang masak sendiri',380000, m3||'-19','masak lebaran 380rb'),
  (uid,'expense','Makanan & Minuman','Makan malam keluarga besar',         550000, m3||'-21','dinner keluarga 550rb'),
  (uid,'expense','Makanan & Minuman','Kue kering & hampers lebaran',       320000, m3||'-10','kue hampers 320rb'),
  (uid,'expense','Makanan & Minuman','Kopi harian selama lebaran',          65000, m3||'-25','kopi 65rb'),

  (uid,'expense','Transportasi',  'Tiket kereta mudik Gambir-Yogya PP',   760000, m3||'-04','mudik kereta 760rb'),
  (uid,'expense','Transportasi',  'Bensin mobil selama mudik',            280000, m3||'-18','bensin mudik 280rb'),
  (uid,'expense','Transportasi',  'Grab & ojek selama libur',              90000, m3||'-28','grab ojek 90rb'),

  (uid,'expense','Tagihan & Utilitas','Listrik PLN',                      265000, m3||'-05','listrik 265rb'),
  (uid,'expense','Tagihan & Utilitas','IndiHome',                         350000, m3||'-05','indihome 350rb'),

  (uid,'expense','Belanja','Baju Lebaran family set (5 orang)',           1250000, m3||'-07','baju lebaran 1.25jt'),
  (uid,'expense','Belanja','Parcel lebaran untuk ortu',                    450000, m3||'-11','parcel lebaran 450rb'),

  (uid,'expense','Hiburan',       'Netflix + Spotify',                    108990, m3||'-01','streaming 109rb'),
  (uid,'expense','Hiburan',       'Wisata keluarga Candi Prambanan',      220000, m3||'-22','prambanan 220rb'),

  (uid,'expense','Paylater & Cicilan','Cicilan laptop Shopee',            450000, m3||'-15','cicilan 450rb'),
  (uid,'expense','Donasi & Sosial','Zakat fitrah 5 jiwa',                 175000, m3||'-17','zakat fitrah 175rb'),
  (uid,'expense','Donasi & Sosial','THR ART + tukang parkir langganan',   350000, m3||'-18','thr art 350rb'),
  (uid,'expense','Donasi & Sosial','Amplop kondangan sepupu',             300000, m3||'-25','amplop kondangan 300rb');

  -- ══ 4 BULAN LALU ═══════════════════════════════════════════════════

  INSERT INTO public.transactions (user_id, type, category, description, amount, transaction_date, raw_text) VALUES

  (uid,'income','Gaji & Upah',        'Gaji PT Kreasi Digital',            5800000, m4||'-01','gaji 5.8jt'),
  (uid,'income','Freelance & Proyek', 'Motion graphic video company',       1200000, m4||'-22','freelance motion 1.2jt'),

  (uid,'expense','Makanan & Minuman','Belanja bulanan supermarket',         398000, m4||'-04','supermarket 398rb'),
  (uid,'expense','Makanan & Minuman','Makan tim saat deadline project',     285000, m4||'-28','makan tim 285rb'),
  (uid,'expense','Makanan & Minuman','Kopi & snack harian 1 bulan',        180000, m4||'-25','kopi snack 180rb'),
  (uid,'expense','Makanan & Minuman','Delivery food 6x',                   168000, m4||'-20','delivery 168rb'),

  (uid,'expense','Transportasi',     'KRL bulanan',                        100000, m4||'-01','krl 100rb'),
  (uid,'expense','Transportasi',     'Ojek online 4 minggu',               155000, m4||'-28','ojek 155rb'),
  (uid,'expense','Transportasi',     'Bensin motor 2x isi full',           130000, m4||'-14','bensin 130rb'),

  (uid,'expense','Tagihan & Utilitas','Listrik PLN',                       268000, m4||'-05','listrik 268rb'),
  (uid,'expense','Tagihan & Utilitas','IndiHome internet',                 350000, m4||'-05','indihome 350rb'),
  (uid,'expense','Tagihan & Utilitas','Pulsa Telkomsel',                    50000, m4||'-04','pulsa 50rb'),

  (uid,'expense','Belanja',          'Celana jogger Brand Erigo 2 pcs',    220000, m4||'-18','erigo 220rb'),
  (uid,'expense','Belanja',          'Smartwatch Amazfit GTS entry',       699000, m4||'-22','amazfit 699rb'),

  (uid,'expense','Hiburan',          'Netflix',                             54000, m4||'-01','netflix 54rb'),
  (uid,'expense','Hiburan',          'Spotify',                             54990, m4||'-01','spotify 55rb'),
  (uid,'expense','Hiburan',          'Bowling + arcade 3 orang',           120000, m4||'-27','bowling arcade 120rb'),

  (uid,'expense','Kesehatan',        'Medical checkup tahunan klinik',     350000, m4||'-10','medical checkup 350rb'),
  (uid,'expense','Paylater & Cicilan','Cicilan laptop Shopee',             450000, m4||'-15','cicilan 450rb'),
  (uid,'expense','Pendidikan',       'Buku desain tipografi',               95000, m4||'-19','buku desain 95rb'),
  (uid,'expense','Perawatan Diri',   'Skincare + parfum rutin',            145000, m4||'-16','skincare parfum 145rb'),
  (uid,'expense','Rumah Tangga',     'Perlengkapan dapur & kebersihan',    110000, m4||'-08','rumah tangga 110rb'),
  (uid,'expense','Donasi & Sosial',  'Donasi yayasan anak yatim',           50000, m4||'-11','donasi yatim 50rb');

  RAISE NOTICE '';
  RAISE NOTICE '✅ Demo data ALEX berhasil dibuat!';
  RAISE NOTICE '══════════════════════════════════════';
  RAISE NOTICE '  Email    : alex@catatin.demo';
  RAISE NOTICE '  Password : Alex@demo2024';
  RAISE NOTICE '  Data     : 5 bulan transaksi lengkap';
  RAISE NOTICE '  Budget   : Rp 4jt–5jt/bulan';
  RAISE NOTICE '══════════════════════════════════════';

END $$;
