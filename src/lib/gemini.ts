import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use gemini-2.0-flash — available on free tier
const MODEL = 'gemini-2.0-flash';

export type ParsedTransaction = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

const VALID_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Tagihan & Utilitas',
  'Lainnya',
] as const;

export async function parseTransaction(rawText: string): Promise<ParsedTransaction> {
  const model = genAI.getGenerativeModel({ model: MODEL });
  const today = new Date().toISOString().split('T')[0];

  const prompt = `Kamu adalah asisten pencatat keuangan. Parse teks berikut menjadi data transaksi terstruktur.

Teks input: "${rawText}"
Tanggal hari ini: ${today}

Kembalikan HANYA JSON valid (tanpa markdown, tanpa kode block) dengan format:
{
  "category": "kategori transaksi (salah satu dari: Makanan & Minuman, Transportasi, Belanja, Hiburan, Kesehatan, Pendidikan, Tagihan & Utilitas, Lainnya)",
  "amount": nominal dalam angka bulat positif (tanpa titik/koma, contoh: 25000),
  "transaction_date": "tanggal dalam format YYYY-MM-DD",
  "description": "deskripsi singkat dalam bahasa Indonesia (maks 50 karakter)"
}

Aturan:
- Jika tidak ada tanggal spesifik, gunakan tanggal hari ini (${today})
- "tadi pagi/siang/malam" = hari ini
- "kemarin" = kemarin
- Amount harus berupa angka bulat positif
- "rb" berarti ribu (25rb = 25000), "jt" berarti juta (1.5jt = 1500000)
- Pilih category yang paling tepat dari daftar di atas`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  const parsed = JSON.parse(cleaned) as ParsedTransaction;

  // Normalize category
  const matched = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === (parsed.category || '').toLowerCase()
  );
  parsed.category = matched ?? 'Lainnya';

  return parsed;
}

export async function generateWeeklyInsight(
  transactions: Array<{
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
  }>
): Promise<string> {
  if (transactions.length === 0) {
    return 'Belum ada transaksi minggu ini. Mulai catat pengeluaran untuk mendapatkan insight.';
  }

  const model = genAI.getGenerativeModel({ model: MODEL });

  const summary = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const summaryText = Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, total]) => `${cat}: Rp ${total.toLocaleString('id-ID')}`)
    .join(', ');

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const prompt = `Kamu adalah asisten keuangan personal. Berikan SATU kalimat insight singkat dan actionable (maksimal 120 karakter) berdasarkan data pengeluaran minggu ini. Jangan gunakan emoji.

Data pengeluaran minggu ini:
- Jumlah transaksi: ${transactions.length}
- Total pengeluaran: Rp ${totalAmount.toLocaleString('id-ID')}
- Breakdown per kategori: ${summaryText}

Format insight yang baik:
- Ringkas, berbahasa Indonesia formal tapi tidak kaku
- Berikan satu saran konkret yang bisa langsung diterapkan
- Tidak menggunakan emoji atau tanda bintang

Kembalikan HANYA kalimatnya saja, tanpa tanda kutip dan tanpa penjelasan tambahan.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim().replace(/^["']|["']$/g, '');
}
