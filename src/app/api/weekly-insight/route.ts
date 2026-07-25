import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyInsight } from '@/lib/gemini';

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

    // Limit data sent to AI
    const limited = transactions.slice(0, MAX_TRANSACTIONS).map((t) => ({
      category: String(t.category ?? '').slice(0, 50),
      amount: Math.max(0, Number(t.amount) || 0),
      transaction_date: String(t.transaction_date ?? '').slice(0, 10),
      description: String(t.description ?? '').slice(0, 100),
    }));

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Layanan AI belum dikonfigurasi.' },
        { status: 503 }
      );
    }

    const insight = await generateWeeklyInsight(limited);
    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error('[weekly-insight] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menghasilkan insight minggu ini.' },
      { status: 500 }
    );
  }
}
