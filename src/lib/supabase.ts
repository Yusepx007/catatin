import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Proxy so existing code using `supabase.xxx` still works
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Transaction = {
  id: string;
  user_id: string;
  raw_text: string;
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  monthly_limit: number;
  month: string;
  created_at: string;
};

