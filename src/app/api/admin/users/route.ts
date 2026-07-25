import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { AppRole, requireAdminUser } from '@/lib/server-auth';

export const runtime = 'nodejs';

const MIN_PASSWORD_LENGTH = 8;
const VALID_ROLES: AppRole[] = ['user', 'admin'];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function normalizeRole(role: unknown): AppRole {
  return role === 'admin' ? 'admin' : 'user';
}

function adminErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message === 'UNAUTHORIZED') {
    return NextResponse.json(
      { error: 'Sesi tidak valid. Silakan masuk kembali.' },
      { status: 401 }
    );
  }

  if (message === 'FORBIDDEN') {
    return NextResponse.json(
      { error: 'Akses ditolak. Role admin diperlukan.' },
      { status: 403 }
    );
  }

  if (message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    return NextResponse.json(
      { error: 'Server admin belum dikonfigurasi. Isi SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 }
    );
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('user_id,email,role,created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      users: data ?? [],
    });
  } catch (error) {
    const response = adminErrorResponse(error);
    if (response) return response;

    console.error('[admin/users:GET] Error:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar user.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let createdUserId: string | null = null;

  try {
    const admin = await requireAdminUser(request);
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type harus application/json' },
        { status: 415 }
      );
    }

    const rateLimit = checkRateLimit(`admin-create-user:${admin.id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Tunggu ${rateLimit.retryAfter} detik lalu coba lagi.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const role = normalizeRole(body.role);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.` },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    });

    if (error || !data.user) {
      throw error ?? new Error('User gagal dibuat.');
    }

    createdUserId = data.user.id;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: data.user.id,
        email,
        role,
      }, { onConflict: 'user_id' });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      createdUserId = null;
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      user: {
        user_id: data.user.id,
        email,
        role,
      },
    }, { status: 201 });
  } catch (error) {
    const response = adminErrorResponse(error);
    if (response) return response;

    if (createdUserId) {
      try {
        await getSupabaseAdmin().auth.admin.deleteUser(createdUserId);
      } catch {
        // Best-effort rollback only.
      }
    }

    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('already')) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 409 }
      );
    }

    console.error('[admin/users:POST] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membuat user baru.' },
      { status: 500 }
    );
  }
}
