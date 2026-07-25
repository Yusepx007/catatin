import { NextRequest, NextResponse } from 'next/server';
import { parseTransaction } from '@/lib/gemini';

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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Layanan AI belum dikonfigurasi. Hubungi administrator.' },
        { status: 503 }
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

    // Handle specific Gemini API errors
    const errObj = error as {
      status?: number;
      statusText?: string;
      message?: string;
      errorDetails?: Array<{ '@type'?: string; retryDelay?: string }>;
    };
    const status = errObj?.status;
    const message = errObj?.message || '';

    if (status === 429) {
      // Extract retryDelay from errorDetails array (Gemini error structure)
      const retryInfo = errObj?.errorDetails?.find(
        (d) => d?.['@type']?.includes('RetryInfo') && d?.retryDelay
      );
      const rawDelay = retryInfo?.retryDelay || '';
      const seconds = parseInt(rawDelay) || 60;
      return NextResponse.json(
        { error: `Batas request tercapai. Tunggu sekitar ${seconds} detik lalu coba lagi.` },
        { status: 429 }
      );
    }

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: 'API key tidak valid. Hubungi administrator.' },
        { status: 503 }
      );
    }

    if (status === 404) {
      return NextResponse.json(
        { error: 'Model AI tidak tersedia. Hubungi administrator.' },
        { status: 503 }
      );
    }

    if (message.includes('JSON') || message.includes('parse') || message.includes('SyntaxError')) {
      return NextResponse.json(
        { error: 'AI gagal membaca format transaksi. Coba tulis lebih spesifik, contoh: "beli kopi 25rb tadi pagi".' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses. Coba lagi dalam beberapa detik.' },
      { status: 500 }
    );
  }
}
