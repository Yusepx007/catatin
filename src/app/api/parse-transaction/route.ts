import { NextRequest, NextResponse } from 'next/server';
import { parseTransaction } from '@/lib/local-ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuthenticatedUser } from '@/lib/server-auth';

export const runtime = 'nodejs';

const MAX_INPUT_LENGTH = 500;
const MIN_INPUT_LENGTH = 3;

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[^\w\s.,!?@#%\-–—'"()\[\]{}:;/\\]/gu, '') // allow only safe chars
    .slice(0, MAX_INPUT_LENGTH);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type harus application/json' },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json(
        { error: 'rawText wajib diisi dan harus berupa teks' },
        { status: 400 }
      );
    }

    const sanitized = sanitizeInput(rawText);

    if (sanitized.length < MIN_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Input terlalu pendek. Minimal ${MIN_INPUT_LENGTH} karakter.` },
        { status: 400 }
      );
    }

    const user = await requireAuthenticatedUser(request);
    const rateLimit = checkRateLimit(`parse:${user.id}`, 30, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Tunggu ${rateLimit.retryAfter} detik lalu coba lagi.` },
        { status: 429 }
      );
    }

    const parsed = await parseTransaction(sanitized);

    // Validate parsed result structure
    if (
      !parsed.category ||
      typeof parsed.amount !== 'number' ||
      parsed.amount <= 0 ||
      !parsed.transaction_date ||
      !parsed.description
    ) {
      return NextResponse.json(
        { error: 'Gagal membaca transaksi. Coba tulis dengan format: "beli kopi 25rb tadi pagi".' },
        { status: 422 }
      );
    }

    // Clamp amount to reasonable range (max 100 juta)
    parsed.amount = Math.min(Math.abs(parsed.amount), 100_000_000);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('[parse-transaction] Error:', error);

    const message = error instanceof Error ? error.message : '';

    if (message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Sesi tidak valid. Silakan masuk kembali.' },
        { status: 401 }
      );
    }

    if (message.includes('JSON') || message.includes('parse') || message.includes('SyntaxError')) {
      return NextResponse.json(
        { error: 'Catatin belum bisa membaca format transaksi. Coba tulis lebih spesifik, contoh: "beli kopi 25rb tadi pagi".' },
        { status: 422 }
      );
    }

    if (message.includes('Nominal')) {
      return NextResponse.json({ error: message }, { status: 422 });
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses. Coba lagi dalam beberapa detik.' },
      { status: 500 }
    );
  }
}
