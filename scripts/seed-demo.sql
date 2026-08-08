-- ══════════════════════════════════════════════════════════════════════
-- CATATIN — Demo Account Seed Data
-- 
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Ganti DEMO_USER_ID di bawah dengan user_id akun demo kamu
--    (Cari di Authentication → Users → copy UUID)
-- 3. Jalankan script ini
-- ══════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  uid UUID := 'GANTI_DENGAN_USER_ID_DEMO';   -- ← GANTI INI
  
  -- helpers
  y  INT := EXTRACT(YEAR  FROM CURRENT_DATE)::INT;
  m  INT := EXTRACT(MONTH FROM CURRENT_DATE)::INT;

  -- month shortcuts (4 bulan terakhir + bulan ini)
  m0 TEXT; -- bulan ini
  m1 TEXT; -- 1 bulan lalu
  m2 TEXT; -- 2 bulan lalu
  m3 TEXT; -- 3 bulan lalu
  m4 TEXT; -- 4 bulan lalu

  -- date helpers
  d0 TEXT; d1 TEXT; d2 TEXT; d3 TEXT;

BEGIN

  -- Build month strings
  m0 := TO_CHAR(MAKE_DATE(y, m,   1), 'YYYY-MM');
  m1 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '1 month', 'YYYY-MM');
  m2 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '2 months','YYYY-MM');
  m3 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '3 months','YYYY-MM');
  m4 := TO_CHAR(MAKE_DATE(y, m,   1) - INTERVAL '4 months','YYYY-MM');

  -- ──────────────────────────────────────────────────────────────────
  -- BUDGETS (5 bulan)
  -- ──────────────────────────────────────────────────────────────────
  INSERT INTO budgets (user_id, month, monthly_limit) VALUES
    (uid, m0, 4500000),
    (uid, m1, 4500000),
    (uid, m2, 4000000),
    (uid, m3, 4000000),
    (uid, m4, 3500000)
  ON CONFLICT (user_id, month) DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit;

  -- ──────────────────────────────────────────────────────────────────
  -- HELPER: generate date within current month (day 1–today or 28)
  -- ──────────────────────────────────────────────────────────────────

  -- ══ BULAN INI (m0) ══

  -- Pemasukan
  INSERT INTO transactions (user_id, type, category, description, amount, transaction_date, raw_text)
  VALUES
    (uid,'income','Gaji & Upah',      'Gaji bulan ini dari PT Maju Bersama',   5500000, m0||'-01', 'gaji 5.5jt'),
    (uid,'income','Freelance & Proyek','Fee desain logo klien Bandung',          850000, m0||'-05', 'freelance logo 850rb'),
    (uid,'income','Bonus & THR',       'Bonus performa Q2',                      500000, m0||'-10', 'bonus 500rb');

  -- Pengeluaran
  INSERT INTO transactions (user_id, type, category, description, amount, transaction_date, raw_text)
  VALUES
    (uid,'expense','Makanan & Minuman','Nasi padang + es teh 2 porsi',     28000,  m0||'-02', 'nasi padang 28rb'),
    (uid,'expense','Makanan & Minuman','Kopi kekinian Jiwa Toast',         25000,  m0||'-03', 'jiwa toast 25rb'),
    (uid,'expense','Makanan & Minuman','Belanja sayur & lauk pasar',       85000,  m0||'-04', 'belanja pasar 85rb'),
    (uid,'expense','Makanan & Minuman','Makan siang warteg kantor',        18000,  m0||'-06', 'warteg 18rb'),
    (uid,'expense','Makanan & Minuman','Indomie goreng + telur 3x',        15000,  m0||'-08', 'indomie 15rb'),
    (uid,'expense','Makanan & Minuman','Dinner di Geprek Bensu',           65000,  m0||'-12', 'geprek bensu 65rb'),
    (uid,'expense','Makanan & Minuman','Grocery Alfamart mingguan',       155000,  m0||'-15', 'alfamart 155rb'),
    (uid,'expense','Transportasi',     'Ojek online ke kantor',            18000,  m0||'-02', 'ojek 18rb'),
    (uid,'expense','Transportasi',     'Grab car pulang kerja hujan',      25000,  m0||'-07', 'grab 25rb'),
    (uid,'expense','Transportasi',     'Token KRL bulanan',               100000,  m0||'-01', 'krl 100rb'),
    (uid,'expense','Transportasi',     'Bensin motor Pertamax',            65000,  m0||'-09', 'bensin 65rb'),
    (uid,'expense','Tagihan & Utilitas','Tagihan listrik PLN',            285000,  m0||'-05', 'listrik 285rb'),
    (uid,'expense','Tagihan & Utilitas','Paket internet Indihome',        280000,  m0||'-05', 'indihome 280rb'),
    (uid,'expense','Tagihan & Utilitas','Pulsa Telkomsel 30 hari',         50000,  m0||'-03', 'pulsa 50rb'),
    (uid,'expense','Belanja',          'Baju casual Uniqlo sale',         299000,  m0||'-10', 'uniqlo 299rb'),
    (uid,'expense','Belanja',          'Cas HP original Samsung',          89000,  m0||'-13', 'charger hp 89rb'),
    (uid,'expense','Perawatan Diri',   'Cukur rambut barbershop',          45000,  m0||'-08', 'cukur 45rb'),
    (uid,'expense','Perawatan Diri',   'Sabun & sampo Lifebuoy',           35000,  m0||'-05', 'sabun sampo 35rb'),
    (uid,'expense','Hiburan',          'Netflix bulan ini',                54000,  m0||'-01', 'netflix 54rb'),
    (uid,'expense','Hiburan',          'Spotify Premium',                  54990,  m0||'-01', 'spotify 55rb'),
    (uid,'expense','Hiburan',          'Nonton bioskop CGV 2 tiket',       80000,  m0||'-11', 'cgv 2 tiket 80rb'),
    (uid,'expense','Kesehatan',        'Vitamin C 90 tablet',              45000,  m0||'-04', 'vitamin 45rb'),
    (uid,'expense','Paylater & Cicilan','Cicilan HP Shopee Paylater',     299000,  m0||'-15', 'cicilan hp 299rb'),
    (uid,'expense','Rumah Tangga',     'Deterjen + pewangi Attack',        42000,  m0||'-06', 'deterjen 42rb'),
    (uid,'expense','Donasi & Sosial',  'Infaq masjid',                     20000,  m0||'-07', 'infaq 20rb');

  -- ══ 1 BULAN LALU (m1) ══

  INSERT INTO transactions (user_id, type, category, description, amount, transaction_date, raw_text)
  VALUES
    (uid,'income','Gaji & Upah',       'Gaji dari PT Maju Bersama',        5500000, m1||'-01', 'gaji 5.5jt'),
    (uid,'income','Freelance & Proyek','Proyek website UMKM Cimahi',       1200000, m1||'-12', 'freelance web 1.2jt'),
    (uid,'income','Investasi',         'Dividen saham BBRI Q1',             125000, m1||'-20', 'dividen bbri 125rb'),

    (uid,'expense','Makanan & Minuman','Belanja bulanan Giant Hypermarket',420000, m1||'-03', 'giant 420rb'),
    (uid,'expense','Makanan & Minuman','Makan siang tim di Sate Khas Senayan',195000,m1||'-10','sate senayan 195rb'),
    (uid,'expense','Makanan & Minuman','Sarapan seblak + boba Fridays',     62000, m1||'-15', 'seblak boba 62rb'),
    (uid,'expense','Makanan & Minuman','Delivery GrabFood weekend',          78000, m1||'-20', 'grabfood 78rb'),
    (uid,'expense','Makanan & Minuman','Kopi kantor harian (seminggu)',       75000, m1||'-25', 'kopi harian 75rb'),
    (uid,'expense','Transportasi',     'Token KRL bulanan',                100000, m1||'-01', 'krl 100rb'),
    (uid,'expense','Transportasi',     'Bensin motor full tank',             70000, m1||'-08', 'bensin 70rb'),
    (uid,'expense','Transportasi',     'Ojek online 5x seminggu',           90000, m1||'-20', 'ojek seminggu 90rb'),
    (uid,'expense','Tagihan & Utilitas','Tagihan listrik PLN',              265000, m1||'-05', 'listrik 265rb'),
    (uid,'expense','Tagihan & Utilitas','Internet Indihome',                280000, m1||'-05', 'indihome 280rb'),
    (uid,'expense','Tagihan & Utilitas','Pulsa Telkomsel',                   50000, m1||'-04', 'pulsa 50rb'),
    (uid,'expense','Belanja',          'Sepatu sneakers distro lokal',      350000, m1||'-14', 'sneakers 350rb'),
    (uid,'expense','Belanja',          'Buku The Psychology of Money',       89000, m1||'-18', 'buku 89rb'),
    (uid,'expense','Hiburan',          'Netflix + Spotify bundle',          108990, m1||'-01', 'streaming 109rb'),
    (uid,'expense','Hiburan',          'Karaoke bersama teman 3 orang',     180000, m1||'-22', 'karaoke 180rb'),
    (uid,'expense','Kesehatan',        'Periksa dokter umum + obat',        150000, m1||'-09', 'dokter 150rb'),
    (uid,'expense','Kesehatan',        'Suplemen multivitamin Blackmores',  125000, m1||'-09', 'vitamin 125rb'),
    (uid,'expense','Perawatan Diri',   'Facial skincare Wardah sebulan',     85000, m1||'-16', 'skincare 85rb'),
    (uid,'expense','Paylater & Cicilan','Cicilan HP Shopee Paylater',       299000, m1||'-15', 'cicilan hp 299rb'),
    (uid,'expense','Rumah Tangga',     'Gas LPG 3kg x2',                    50000, m1||'-10', 'gas lpg 50rb'),
    (uid,'expense','Donasi & Sosial',  'Sumbangan nikahan teman',           200000, m1||'-17', 'amplop nikah 200rb'),
    (uid,'expense','Donasi & Sosial',  'Infaq jumat',                        20000, m1||'-07', 'infaq 20rb');

  -- ══ 2 BULAN LALU (m2) ══

  INSERT INTO transactions (user_id, type, category, description, amount, transaction_date, raw_text)
  VALUES
    (uid,'income','Gaji & Upah',       'Gaji dari PT Maju Bersama',        5500000, m2||'-01', 'gaji 5.5jt'),
    (uid,'income','Freelance & Proyek','Edit video konten Instagram',        400000, m2||'-08', 'freelance video 400rb'),
    (uid,'income','Bisnis',            'Jual preloved sneakers IG',          550000, m2||'-20', 'jual preloved 550rb'),

    (uid,'expense','Makanan & Minuman','Grocery mingguan Indomaret 4x',     360000, m2||'-25', 'indomaret 360rb'),
    (uid,'expense','Makanan & Minuman','Makan malam Japanese resto',        145000, m2||'-13', 'japanese resto 145rb'),
    (uid,'expense','Makanan & Minuman','Kopi & snack WFH',                   88000, m2||'-18', 'kopi snack 88rb'),
    (uid,'expense','Makanan & Minuman','GrabFood 3x delivery',               97000, m2||'-22', 'grabfood 97rb'),
    (uid,'expense','Transportasi',     'KRL bulanan',                       100000, m2||'-01', 'krl 100rb'),
    (uid,'expense','Transportasi',     'Bensin motor',                       65000, m2||'-07', 'bensin 65rb'),
    (uid,'expense','Transportasi',     'Uber airport jemput teman',          95000, m2||'-28', 'uber airport 95rb'),
    (uid,'expense','Tagihan & Utilitas','Listrik PLN',                      255000, m2||'-05', 'listrik 255rb'),
    (uid,'expense','Tagihan & Utilitas','Indihome internet',                 280000, m2||'-05', 'indihome 280rb'),
    (uid,'expense','Tagihan & Utilitas','Pulsa',                              50000, m2||'-04', 'pulsa 50rb'),
    (uid,'expense','Belanja',          'Baju batik kondangan',              250000, m2||'-19', 'baju batik 250rb'),
    (uid,'expense','Belanja',          'Earphone JBL',                      199000, m2||'-15', 'earphone jbl 199rb'),
    (uid,'expense','Hiburan',          'Netflix',                            54000, m2||'-01', 'netflix 54rb'),
    (uid,'expense','Hiburan',          'Spotify',                            54990, m2||'-01', 'spotify 55rb'),
    (uid,'expense','Hiburan',          'Tiket konser indie 2 orang',        300000, m2||'-23', 'konser indie 300rb'),
    (uid,'expense','Kesehatan',        'Vitamin & suplemen bulanan',         95000, m2||'-04', 'vitamin 95rb'),
    (uid,'expense','Paylater & Cicilan','Cicilan HP Shopee Paylater',       299000, m2||'-15', 'cicilan 299rb'),
    (uid,'expense','Perawatan Diri',   'Potong rambut + hair spa',           75000, m2||'-10', 'potong rambut 75rb'),
    (uid,'expense','Rumah Tangga',     'Alat kebersihan rumah',              68000, m2||'-12', 'alat bersih 68rb'),
    (uid,'expense','Pendidikan',       'Kursus online Udemy (lifetime)',     149000, m2||'-05', 'udemy 149rb'),
    (uid,'expense','Donasi & Sosial',  'Infaq & sedekah',                    50000, m2||'-14', 'infaq 50rb');

  -- ══ 3 BULAN LALU (m3) ══

  INSERT INTO transactions (user_id, type, category, description, amount, transaction_date, raw_text)
  VALUES
    (uid,'income','Gaji & Upah',       'Gaji dari PT Maju Bersama',        5500000, m3||'-01', 'gaji 5.5jt'),
    (uid,'income','Bonus & THR',       'THR Lebaran dari kantor',          5500000, m3||'-15', 'thr lebaran 5.5jt'),
    (uid,'income','Hadiah & Hibah',    'Angpao Lebaran dari keluarga',      800000, m3||'-22', 'angpao lebaran 800rb'),

    (uid,'expense','Makanan & Minuman','Belanja lebaran & parcel',          850000, m3||'-10', 'belanja lebaran 850rb'),
    (uid,'expense','Makanan & Minuman','Makanan hari raya & opor',          320000, m3||'-20', 'opor lebaran 320rb'),
    (uid,'expense','Makanan & Minuman','Makan malam keluarga besar',        450000, m3||'-21', 'makan keluarga 450rb'),
    (uid,'expense','Makanan & Minuman','Kopi & snack harian',               120000, m3||'-25', 'kopi snack 120rb'),
    (uid,'expense','Transportasi',     'Tiket mudik kereta Argo Wilis',     480000, m3||'-05', 'mudik kereta 480rb'),
    (uid,'expense','Transportasi',     'Bensin mobil mudik PP',             300000, m3||'-18', 'bensin mudik 300rb'),
    (uid,'expense','Transportasi',     'Ojek & grab lokal',                  85000, m3||'-28', 'ojek grab 85rb'),
    (uid,'expense','Tagihan & Utilitas','Listrik PLN',                      260000, m3||'-05', 'listrik 260rb'),
    (uid,'expense','Tagihan & Utilitas','Indihome',                         280000, m3||'-05', 'indihome 280rb'),
    (uid,'expense','Belanja',          'Baju lebaran keluarga 4 stel',      960000, m3||'-08', 'baju lebaran 960rb'),
    (uid,'expense','Belanja',          'Kue kering lebaran 3 toples',       180000, m3||'-12', 'kue lebaran 180rb'),
    (uid,'expense','Hiburan',          'Netflix + Spotify',                 108990, m3||'-01', 'streaming 109rb'),
    (uid,'expense','Hiburan',          'Family karaoke lebaran',            250000, m3||'-21', 'karaoke keluarga 250rb'),
    (uid,'expense','Paylater & Cicilan','Cicilan HP Shopee Paylater',       299000, m3||'-15', 'cicilan 299rb'),
    (uid,'expense','Donasi & Sosial',  'Zakat fitrah 3 jiwa',              105000, m3||'-18', 'zakat fitrah 105rb'),
    (uid,'expense','Donasi & Sosial',  'THR ART + driver ojek langganan',   200000, m3||'-19', 'thr art 200rb'),
    (uid,'expense','Rumah Tangga',     'Bersih-bersih rumah + lap',          55000, m3||'-15', 'alat bersih 55rb');

  -- ══ 4 BULAN LALU (m4) ══

  INSERT INTO transactions (user_id, type, category, description, amount, transaction_date, raw_text)
  VALUES
    (uid,'income','Gaji & Upah',       'Gaji dari PT Maju Bersama',        5200000, m4||'-01', 'gaji 5.2jt'),
    (uid,'income','Freelance & Proyek','Desain poster event kampus',         350000, m4||'-18', 'freelance poster 350rb'),

    (uid,'expense','Makanan & Minuman','Belanja bulanan supermarket',        380000, m4||'-04', 'supermarket 380rb'),
    (uid,'expense','Makanan & Minuman','Makan tim proyek akhir bulan',       220000, m4||'-28', 'makan tim 220rb'),
    (uid,'expense','Makanan & Minuman','Kopi + snack harian seminggu',        90000, m4||'-14', 'kopi snack 90rb'),
    (uid,'expense','Makanan & Minuman','GrabFood 4x',                         86000, m4||'-20', 'grabfood 86rb'),
    (uid,'expense','Transportasi',     'KRL bulanan',                        100000, m4||'-01', 'krl 100rb'),
    (uid,'expense','Transportasi',     'Bensin motor 2x full',                130000, m4||'-15', 'bensin 130rb'),
    (uid,'expense','Tagihan & Utilitas','Listrik PLN',                        250000, m4||'-05', 'listrik 250rb'),
    (uid,'expense','Tagihan & Utilitas','Indihome',                           280000, m4||'-05', 'indihome 280rb'),
    (uid,'expense','Tagihan & Utilitas','Pulsa Telkomsel',                     50000, m4||'-04', 'pulsa 50rb'),
    (uid,'expense','Belanja',          'Celana jeans Levi''s outlet',         450000, m4||'-16', 'levis outlet 450rb'),
    (uid,'expense','Hiburan',          'Netflix',                              54000, m4||'-01', 'netflix 54rb'),
    (uid,'expense','Hiburan',          'Spotify',                              54990, m4||'-01', 'spotify 55rb'),
    (uid,'expense','Hiburan',          'Bowling 2 orang',                      80000, m4||'-25', 'bowling 80rb'),
    (uid,'expense','Kesehatan',        'Medical checkup klinik',              200000, m4||'-10', 'cek kesehatan 200rb'),
    (uid,'expense','Paylater & Cicilan','Cicilan HP Shopee Paylater',         299000, m4||'-15', 'cicilan 299rb'),
    (uid,'expense','Perawatan Diri',   'Skincare routine bulanan',             75000, m4||'-12', 'skincare 75rb'),
    (uid,'expense','Pendidikan',       'Buku akuntansi keuangan pribadi',      65000, m4||'-22', 'buku 65rb'),
    (uid,'expense','Rumah Tangga',     'Sabun, tisu, perlengkapan dapur',      95000, m4||'-08', 'rumah tangga 95rb'),
    (uid,'expense','Donasi & Sosial',  'Sumbangan korban banjir',              50000, m4||'-11', 'donasi banjir 50rb');

  RAISE NOTICE '✅ Demo data berhasil di-seed untuk user: %', uid;
  RAISE NOTICE '   Bulan di-seed: %, %, %, %, %', m0, m1, m2, m3, m4;
  RAISE NOTICE '   Total pemasukan bulan ini: Rp 6.850.000';
  RAISE NOTICE '   Total pengeluaran bulan ini: Rp 1.853.990 (estimasi)';

END $$;
