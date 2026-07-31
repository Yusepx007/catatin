import { generateWeeklyInsightWithRules, parseTransactionWithRules } from '@/lib/catatin-ai';
import { EXPENSE_CATEGORIES, normalizeExpenseCategory } from '@/lib/categories';

export type ParsedTransaction = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

type LocalAiCommand = 'parse' | 'insight';
type TransactionInput = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

function getTodayInJakarta(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function extractJsonObject(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('LLM tidak mengembalikan JSON valid.');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeParsedTransaction(value: unknown): ParsedTransaction {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Format transaksi dari LLM tidak valid.');
  }

  const input = value as Partial<ParsedTransaction>;
  const matchedCategory = normalizeExpenseCategory(String(input.category ?? ''));
  const amount = Math.min(Math.abs(Number(input.amount) || 0), 100_000_000);
  const transactionDate = String(input.transaction_date ?? '').slice(0, 10);
  const description = String(input.description ?? '').trim().slice(0, 50);

  if (!amount || !/^\d{4}-\d{2}-\d{2}$/.test(transactionDate) || !description) {
    throw new Error('Transaksi dari LLM tidak lengkap.');
  }

  return {
    category: matchedCategory,
    amount,
    transaction_date: transactionDate,
    description,
  };
}

async function runGroqAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY belum dikonfigurasi.');
  }

  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  const isParse = command === 'parse';
  const rawText = typeof payload === 'object' && payload !== null && 'rawText' in payload
    ? String((payload as { rawText: unknown }).rawText)
    : '';
  const transactions = typeof payload === 'object' && payload !== null && 'transactions' in payload
    ? (payload as { transactions: unknown }).transactions
    : [];

  const prompt = isParse
    ? `Parse transaksi keuangan Indonesia.
Tanggal hari ini: ${getTodayInJakarta()}
Input: "${rawText}"

Kembalikan HANYA JSON valid:
{
  "category": "salah satu: ${EXPENSE_CATEGORIES.join(', ')}",
  "amount": angka bulat positif,
  "transaction_date": "YYYY-MM-DD",
  "description": "deskripsi singkat bahasa Indonesia, maks 50 karakter"
}

Aturan: rb=ribu, jt=juta, kemarin=H-1, tadi pagi/siang/sore/malam=hari ini.`
    : `Buat satu insight pengeluaran mingguan, bahasa Indonesia, actionable, maksimal 120 karakter, tanpa emoji.

Data transaksi:
${JSON.stringify(transactions, null, 2)}

Kembalikan HANYA JSON valid:
{
  "insight": "kalimat insight"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Kamu hanya menjawab JSON valid tanpa markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: isParse ? 220 : 120,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null) as unknown;
    if (!response.ok) {
      const message =
        typeof body === 'object' && body !== null && 'error' in body
          ? JSON.stringify((body as { error: unknown }).error)
          : 'Groq gagal memproses request.';
      throw new Error(message);
    }

    const content =
      typeof body === 'object' && body !== null && 'choices' in body
        ? String((body as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content ?? '')
        : '';
    const parsed = extractJsonObject(content);

    if (isParse) {
      return normalizeParsedTransaction(parsed) as T;
    }

    const insight =
      typeof parsed === 'object' && parsed !== null && 'insight' in parsed
        ? String((parsed as { insight: unknown }).insight).trim().replace(/^["']|["']$/g, '')
        : '';
    if (!insight) {
      throw new Error('Insight dari Groq kosong.');
    }

    return { insight: insight.slice(0, 120) } as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Groq terlalu lama merespons.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function runAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
  if (process.env.GROQ_API_KEY?.trim()) {
    return runGroqAi<T>(command, payload).catch((error) => {
      console.warn('[catatin-ai] Groq fallback to TypeScript rules:', error);
      return runRulesAi<T>(command, payload);
    });
  }

  return runRulesAi<T>(command, payload);
}

function runRulesAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
  if (command === 'parse') {
    const rawText = typeof payload === 'object' && payload !== null && 'rawText' in payload
      ? String((payload as { rawText: unknown }).rawText)
      : '';
    return Promise.resolve(parseTransactionWithRules(rawText) as T);
  }

  const transactions: TransactionInput[] = typeof payload === 'object' && payload !== null && 'transactions' in payload
    ? (payload as { transactions: TransactionInput[] }).transactions
    : [];
  return Promise.resolve({ insight: generateWeeklyInsightWithRules(transactions) } as T);
}

export function parseTransaction(rawText: string): Promise<ParsedTransaction> {
  return runAi<ParsedTransaction>('parse', { rawText });
}

export async function generateWeeklyInsight(
  transactions: Array<{
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
  }>
): Promise<string> {
  const result = await runAi<{ insight: string }>('insight', { transactions });
  return result.insight;
}
