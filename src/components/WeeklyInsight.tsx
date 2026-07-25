'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  transactions: Array<{
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
  }>;
};

function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2a4 4 0 0 1 2 7.46V11H6V9.46A4 4 0 0 1 8 2zM6 12h4M7 14h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1.5 6.5A5 5 0 0 1 10 2.5L11.5 4M11.5 6.5A5 5 0 0 1 3 10.5L1.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WeeklyInsight({ transactions }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchInsight = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Sesi tidak valid. Silakan masuk kembali.');

      const res = await fetch('/api/weekly-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ transactions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInsight(data.insight);
      setLoaded(true);
    } catch {
      setInsight('Gagal memuat insight. Periksa koneksi dan coba lagi.');
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(96, 165, 250, 0.06))',
          border: '1px solid rgba(134, 239, 172, 0.18)',
          borderRadius: 20,
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: loading ? 'default' : 'pointer',
          transition: 'border-color 0.2s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
        onClick={fetchInsight}
        onMouseEnter={(e) => !loading && ((e.currentTarget).style.borderColor = 'rgba(16,185,129,0.35)')}
        onMouseLeave={(e) => ((e.currentTarget).style.borderColor = 'rgba(16,185,129,0.18)')}
      >
        <div style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexShrink: 0,
        }}>
          {loading ? (
            <div style={{
              width: 14,
              height: 14,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
            }} className="animate-spin-slow" />
          ) : <LightbulbIcon />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent-green-light)', marginBottom: 2 }}>
            Insight Mingguan AI Lokal
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {loading ? 'Menganalisis pola pengeluaran minggu ini...' : 'Klik untuk melihat analisis dari Catatin AI'}
          </p>
        </div>
        {!loading && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 999,
              padding: '6px 12px',
            color: 'var(--accent-green)',
            fontSize: 11,
            fontWeight: 600,
            flexShrink: 0,
          }}>
            Generate
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(96, 165, 250, 0.06))',
      border: '1px solid rgba(134, 239, 172, 0.18)',
      borderRadius: 20,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      animation: 'fadeInUp 0.35s ease',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 40,
        height: 40,
        background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0,
      }}>
        <LightbulbIcon />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 11, color: 'var(--accent-green)', marginBottom: 4, letterSpacing: '0.06em' }}>
          INSIGHT MINGGU INI
        </p>
        <p style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.55 }}>
          {insight}
        </p>
      </div>
      <button
        id="refresh-insight-btn"
        onClick={() => { setLoaded(false); setInsight(null); }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
          display: 'flex',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget).style.color = 'var(--text-secondary)')}
        onMouseLeave={(e) => ((e.currentTarget).style.color = 'var(--text-muted)')}
        title="Perbarui insight"
        aria-label="Perbarui insight"
      >
        <RefreshIcon />
      </button>
    </div>
  );
}
