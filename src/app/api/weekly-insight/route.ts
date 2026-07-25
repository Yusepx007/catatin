import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyInsight } from '@/lib/local-ai';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAuthenticatedUser } from '@/lib/server-auth';

export const runtime = 'nodejs';

const MAX_TRANSACTIONS = 200;

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
    const { transactions } = body;

    if (!Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'transactions harus berupa array' },
        { status: 400 }
      );
    }

    const user = await requireAuthenticatedUser(request);
    const rateLimit = checkRateLimit(`weekly-insight:${user.id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Tunggu ${rateLimit.retryAfter} detik lalu coba lagi.` },
        { status: 429 }
      );
    }

    // Limit data sent to the local AI engine
    const limited = transactions.slice(0, MAX_TRANSACTIONS).map((t) => ({
      category: String(t.category ?? '').slice(0, 50),
      amount: Math.max(0, Number(t.amount) || 0),
      transaction_date: String(t.transaction_date ?? '').slice(0, 10),
      description: String(t.description ?? '').slice(0, 100),
    }));

    const insight = await generateWeeklyInsight(limited);
    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('[weekly-insight] Error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Sesi tidak valid. Silakan masuk kembali.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Gagal menghasilkan insight minggu ini.' },
      { status: 500 }
    );
  }
}
