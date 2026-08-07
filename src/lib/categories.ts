export const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Paylater & Cicilan',
  'Perawatan Diri',
  'Rumah Tangga',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan & Utilitas',
  'Donasi & Sosial',
  'Lainnya',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const INCOME_CATEGORIES = [
  'Gaji & Upah',
  'Freelance & Proyek',
  'Bisnis',
  'Investasi',
  'Bonus & THR',
  'Hadiah & Hibah',
  'Penjualan',
  'Pendapatan Lainnya',
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export type TransactionType = 'expense' | 'income';

export const INCOME_COLORS: Record<IncomeCategory, string> = {
  'Gaji & Upah': '#22c55e',
  'Freelance & Proyek': '#2dd4bf',
  'Bisnis': '#38bdf8',
  'Investasi': '#818cf8',
  'Bonus & THR': '#fbbf24',
  'Hadiah & Hibah': '#fb7185',
  'Penjualan': '#34d399',
  'Pendapatan Lainnya': '#94a3b8',
};

export const INCOME_INITIALS: Record<IncomeCategory, string> = {
  'Gaji & Upah': 'GJ',
  'Freelance & Proyek': 'FL',
  'Bisnis': 'BS',
  'Investasi': 'IV',
  'Bonus & THR': 'BN',
  'Hadiah & Hibah': 'HD',
  'Penjualan': 'JL',
  'Pendapatan Lainnya': 'LN',
};

export const INCOME_KEYWORDS: Record<IncomeCategory, string[]> = {
  'Gaji & Upah': ['gaji', 'upah', 'salary', 'slip gaji', 'transfer gaji', 'payroll', 'terima gaji'],
  'Freelance & Proyek': ['freelance', 'proyek', 'project', 'client', 'klien', 'kontrak', 'jasa'],
  'Bisnis': ['bisnis', 'usaha', 'omzet', 'penjualan toko', 'dagangan', 'lapak'],
  'Investasi': ['investasi', 'saham', 'dividen', 'bunga deposito', 'return', 'reksadana', 'crypto'],
  'Bonus & THR': ['bonus', 'thr', 'tunjangan', 'insentif', 'komisi', 'reward'],
  'Hadiah & Hibah': ['hadiah', 'hibah', 'pemberian', 'kado', 'uang saku', 'kiriman'],
  'Penjualan': ['jual', 'jualan', 'sold', 'penjualan', 'marketplace', 'shopee', 'tokopedia', 'olshop'],
  'Pendapatan Lainnya': [],
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Makanan & Minuman': '#fb923c',
  Transportasi: '#60a5fa',
  Belanja: '#c084fc',
  'Paylater & Cicilan': '#f43f5e',
  'Perawatan Diri': '#2dd4bf',
  'Rumah Tangga': '#a3e635',
  Hiburan: '#f472b6',
  Kesehatan: '#34d399',
  Pendidikan: '#fbbf24',
  'Tagihan & Utilitas': '#f87171',
  'Donasi & Sosial': '#38bdf8',
  Lainnya: '#94a3b8',
};

export const CATEGORY_CLASSES: Record<ExpenseCategory, string> = {
  'Makanan & Minuman': 'cat-food',
  Transportasi: 'cat-transport',
  Belanja: 'cat-shopping',
  'Paylater & Cicilan': 'cat-paylater',
  'Perawatan Diri': 'cat-self-care',
  'Rumah Tangga': 'cat-household',
  Hiburan: 'cat-entertainment',
  Kesehatan: 'cat-health',
  Pendidikan: 'cat-education',
  'Tagihan & Utilitas': 'cat-bills',
  'Donasi & Sosial': 'cat-social',
  Lainnya: 'cat-other',
};

export const CATEGORY_INITIALS: Record<ExpenseCategory, string> = {
  'Makanan & Minuman': 'MK',
  Transportasi: 'TR',
  Belanja: 'BL',
  'Paylater & Cicilan': 'PC',
  'Perawatan Diri': 'PD',
  'Rumah Tangga': 'RT',
  Hiburan: 'HB',
  Kesehatan: 'KS',
  Pendidikan: 'PN',
  'Tagihan & Utilitas': 'TG',
  'Donasi & Sosial': 'DS',
  Lainnya: 'LN',
};

export const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  'Makanan & Minuman': [
    'makan',
    'minum',
    'kopi',
    'nasi',
    'mie',
    'mi ',
    'ayam',
    'bakso',
    'sate',
    'seblak',
    'warteg',
    'resto',
    'restoran',
    'cafe',
    'kafe',
    'roti',
    'snack',
    'cemilan',
    'teh',
    'es ',
  ],
  Transportasi: [
    'grab',
    'gojek',
    'ojol',
    'taksi',
    'bus',
    'mrt',
    'lrt',
    'angkot',
    'kereta',
    'bensin',
    'parkir',
    'tol',
    'transport',
    'naik',
  ],
  Belanja: [
    'shopee',
    'tokopedia',
    'lazada',
    'marketplace',
    'baju',
    'celana',
    'sepatu',
    'tas',
    'barang',
    'fotocopy',
    'print',
  ],
  'Paylater & Cicilan': [
    'paylater',
    'spaylater',
    'gopaylater',
    'kredivo',
    'akulaku',
    'cicilan',
    'angsuran',
    'kredit',
    'pinjaman',
    'tagihan paylater',
  ],
  'Perawatan Diri': [
    'skincare',
    'sabun',
    'sampo',
    'shampoo',
    'odol',
    'pasta gigi',
    'sikat gigi',
    'deodorant',
    'parfum',
    'lotion',
    'facial wash',
    'body wash',
    'alat mandi',
    'mandi',
    'salon',
    'barber',
    'potong rambut',
  ],
  'Rumah Tangga': [
    'deterjen',
    'pewangi',
    'laundry',
    'pel',
    'sapu',
    'tisu',
    'tissue',
    'galon',
    'gas',
    'elpiji',
    'aqua',
    'pembersih',
    'alat rumah',
    'perkakas',
    'isi ulang',
  ],
  Hiburan: [
    'spotify',
    'netflix',
    'bioskop',
    'game',
    'konser',
    'nongkrong',
    'hiburan',
    'youtube',
    'cinema',
  ],
  Kesehatan: [
    'obat',
    'dokter',
    'klinik',
    'rumah sakit',
    'vitamin',
    'apotek',
    'periksa',
    'masker',
  ],
  Pendidikan: [
    'buku',
    'kampus',
    'kuliah',
    'kelas',
    'kursus',
    'sekolah',
    'spp',
    'modul',
    'belajar',
  ],
  'Tagihan & Utilitas': [
    'listrik',
    'air',
    'pdam',
    'wifi',
    'internet',
    'pulsa',
    'kuota',
    'kost',
    'kos',
    'kontrakan',
    'tagihan',
    'sewa',
    'bpjs',
  ],
  'Donasi & Sosial': [
    'donasi',
    'sedekah',
    'infaq',
    'infak',
    'zakat',
    'iuran',
    'patungan',
    'sumbangan',
    'kado',
    'hadiah',
    'bantu teman',
  ],
  Lainnya: [],
};

export function isExpenseCategory(category: string): category is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
}

export function normalizeExpenseCategory(category: string): ExpenseCategory {
  const matched = EXPENSE_CATEGORIES.find(
    (item) => item.toLowerCase() === category.trim().toLowerCase()
  );
  return matched ?? 'Lainnya';
}

export function isIncomeCategory(category: string): category is IncomeCategory {
  return INCOME_CATEGORIES.includes(category as IncomeCategory);
}

export function normalizeIncomeCategory(category: string): IncomeCategory {
  const matched = INCOME_CATEGORIES.find(
    (item) => item.toLowerCase() === category.trim().toLowerCase()
  );
  return matched ?? 'Pendapatan Lainnya';
}

export function getCategoryColor(category: string): string {
  if (isExpenseCategory(category)) return CATEGORY_COLORS[category];
  if (isIncomeCategory(category)) return INCOME_COLORS[category];
  return '#94a3b8';
}

export function getCategoryInitials(category: string): string {
  if (isExpenseCategory(category)) return CATEGORY_INITIALS[category];
  if (isIncomeCategory(category)) return INCOME_INITIALS[category];
  return 'LN';
}

export function guessIncomeCategory(text: string): IncomeCategory {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(INCOME_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return cat as IncomeCategory;
    }
  }
  return 'Pendapatan Lainnya';
}
