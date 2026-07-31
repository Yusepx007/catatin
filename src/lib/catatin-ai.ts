import { CATEGORY_KEYWORDS } from '@/lib/categories';

export type ParsedTransaction = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

type TransactionInput = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

const MONTHS: Record<string, number> = {
  jan: 1,
  januari: 1,
  feb: 2,
  februari: 2,
  mar: 3,
  maret: 3,
  apr: 4,
  april: 4,
  mei: 5,
  jun: 6,
  juni: 6,
  jul: 7,
  juli: 7,
  agu: 8,
  agustus: 8,
  sep: 9,
  sept: 9,
  september: 9,
  okt: 10,
  oktober: 10,
  nov: 11,
  november: 11,
  des: 12,
  desember: 12,
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function toIsoDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function createDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getTodayInJakarta(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  return createDate(year, month, day);
}

function parseNumber(rawNumber: string, suffix?: string): number {
  const normalized = rawNumber.trim().toLowerCase().replace(/\s+/g, '');
  const lowerSuffix = suffix?.toLowerCase() ?? '';
  const hasThousandSeparator = /^\d{1,3}(?:[.]\d{3})+$/.test(normalized);
  const numericValue = hasThousandSeparator
    ? Number(normalized.replace(/\./g, ''))
    : Number(normalized.replace(',', '.'));

  let value = Number.isFinite(numericValue) ? numericValue : 0;

  if (['rb', 'ribu', 'k'].includes(lowerSuffix)) {
    value *= 1_000;
  } else if (['jt', 'juta', 'mio'].includes(lowerSuffix)) {
    value *= 1_000_000;
  }

  return Math.max(0, Math.round(value));
}

function findAmount(text: string): { amount: number; span: [number, number] } | null {
  const pattern = /(\brp\.?\s*)?(\d{1,3}(?:[.]\d{3})+|\d+(?:[,.]\d+)?)\s*(rb|ribu|k|jt|juta|mio)?\b/gi;
  let best: { score: number; amount: number; span: [number, number] } | null = null;

  for (const match of text.matchAll(pattern)) {
    const amount = parseNumber(match[2] ?? '', match[3]);
    const hasMarker = Boolean(match[1] || match[3]);

    if (amount < 1_000 && !hasMarker) continue;

    const score = amount + (hasMarker ? 1_000_000_000 : 0);
    const span: [number, number] = [match.index ?? 0, (match.index ?? 0) + match[0].length];

    if (!best || score > best.score) {
      best = { score, amount, span };
    }
  }

  return best ? { amount: best.amount, span: best.span } : null;
}

function parseTransactionDate(text: string, today: Date): Date {
  const normalized = normalizeText(text);

  const iso = normalized.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    return createDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const numeric = normalized.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](20\d{2}))?\b/);
  if (numeric) {
    return createDate(Number(numeric[3] ?? today.getUTCFullYear()), Number(numeric[2]), Number(numeric[1]));
  }

  const monthPattern = Object.keys(MONTHS).join('|');
  const named = normalized.match(new RegExp(`\\b(\\d{1,2})\\s+(${monthPattern})(?:\\s+(20\\d{2}))?\\b`));
  if (named) {
    return createDate(Number(named[3] ?? today.getUTCFullYear()), MONTHS[named[2]], Number(named[1]));
  }

  const daysAgo = normalized.match(/\b(\d{1,2})\s+hari\s+lalu\b/);
  if (daysAgo) {
    return addDays(today, -Number(daysAgo[1]));
  }

  if (normalized.includes('kemarin lusa')) return addDays(today, -2);
  if (normalized.includes('kemarin') || normalized.includes('semalam')) return addDays(today, -1);
  if (normalized.includes('minggu lalu')) return addDays(today, -7);
  if (normalized.includes('besok')) return addDays(today, 1);

  return today;
}

function inferCategory(text: string): string {
  const normalized = ` ${normalizeText(text)} `;
  const scores = new Map<string, number>();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        score += keyword.trim().length > 4 ? 2 : 1;
      }
    }
    if (score > 0) scores.set(category, score);
  }

  let bestCategory = 'Lainnya';
  let bestScore = 0;
  for (const [category, score] of scores.entries()) {
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  return bestCategory;
}

function buildDescription(text: string, amountSpan: [number, number]): string {
  let cleaned = `${text.slice(0, amountSpan[0])} ${text.slice(amountSpan[1])}`;
  cleaned = cleaned.replace(
    /\b(tadi|pagi|siang|sore|malam|hari ini|kemarin|kemarin lusa|semalam|minggu lalu|besok)\b/gi,
    ' '
  );
  cleaned = cleaned.replace(/\b\d{1,2}\s+hari\s+lalu\b/gi, ' ');
  cleaned = cleaned.replace(/\b(20\d{2}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}(?:[/-]20\d{2})?)\b/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/^[ .,-]+|[ .,-]+$/g, '');

  if (!cleaned) cleaned = 'Pengeluaran';

  const limited = cleaned.slice(0, 50).trim();
  return limited.charAt(0).toUpperCase() + limited.slice(1);
}

export function parseTransactionWithRules(rawText: string): ParsedTransaction {
  const text = rawText.trim();
  const amountResult = findAmount(text);
  if (!amountResult) {
    throw new Error('Nominal belum terbaca. Contoh: "beli kopi 25rb tadi pagi".');
  }

  const transactionDate = parseTransactionDate(text, getTodayInJakarta());

  return {
    category: inferCategory(text),
    amount: Math.min(amountResult.amount, 100_000_000),
    transaction_date: toIsoDate(transactionDate),
    description: buildDescription(text, amountResult.span),
  };
}

export function generateWeeklyInsightWithRules(transactions: TransactionInput[]): string {
  const valid = transactions.filter((transaction) => Number(transaction.amount) > 0);
  if (valid.length === 0) {
    return 'Belum ada transaksi minggu ini. Mulai catat pengeluaran untuk mendapatkan insight.';
  }

  const totals = new Map<string, number>();
  for (const transaction of valid) {
    const category = transaction.category || 'Lainnya';
    totals.set(category, (totals.get(category) ?? 0) + Number(transaction.amount));
  }

  let topCategory = 'Lainnya';
  let topAmount = 0;
  let totalAmount = 0;
  for (const [category, amount] of totals.entries()) {
    totalAmount += amount;
    if (amount > topAmount) {
      topCategory = category;
      topAmount = amount;
    }
  }

  const suggestions: Record<string, string> = {
    'Makanan & Minuman': 'coba tetapkan limit makan harian',
    Transportasi: 'cek opsi rute atau jadwal yang lebih hemat',
    Belanja: 'tunda belanja non-wajib selama 24 jam',
    'Paylater & Cicilan': 'cek jatuh tempo dan hindari cicilan baru dulu',
    'Perawatan Diri': 'bedakan kebutuhan rutin dan belanja perawatan impulsif',
    'Rumah Tangga': 'buat daftar belanja rumah agar tidak dobel beli',
    Hiburan: 'pilih satu langganan utama minggu ini',
    Kesehatan: 'sisihkan dana kesehatan agar tidak mengganggu budget lain',
    Pendidikan: 'pisahkan kebutuhan belajar dari belanja impulsif',
    'Tagihan & Utilitas': 'catat tanggal jatuh tempo agar cashflow lebih rapi',
    'Donasi & Sosial': 'tetapkan pos sosial bulanan agar tetap terukur',
    Lainnya: 'beri deskripsi lebih detail agar pola pengeluaran makin jelas',
  };

  const share = Math.round((topAmount / totalAmount) * 100);
  const insight = `${topCategory} menyerap ${share}% pengeluaran minggu ini; ${suggestions[topCategory] ?? suggestions.Lainnya}.`;
  return `${insight.slice(0, 119).replace(/[ ;,.]+$/g, '')}.`;
}
