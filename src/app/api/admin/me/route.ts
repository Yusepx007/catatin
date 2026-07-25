import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/server-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request);
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Sesi tidak valid. Silakan masuk kembali.' },
        { status: 401 }
      );
    }

    console.error('[admin/me] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membaca role pengguna.' },
      { status: 500 }
    );
  }
}
