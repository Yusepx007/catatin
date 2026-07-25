import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type AppRole = 'admin' | 'user';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: AppRole;
};

export function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function requireAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser> {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error('UNAUTHORIZED');
  }

  const supabase = createSupabaseServerClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('UNAUTHORIZED');
  }

  const email = data.user.email || '';
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role,email')
    .eq('user_id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: String(profile?.email || email),
    role: !profileError && profile?.role === 'admin' ? 'admin' : 'user',
  };
}

export async function requireAdminUser(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(request);
  if (user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
