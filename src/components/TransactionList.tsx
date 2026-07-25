'use client';

import { supabase, Transaction } from '@/lib/supabase';
import { useState } from 'react';

type Props = {
  transactions: Transaction[];
  onDeleted: () => void;
};

const categoryColors: Record<string, string> = {
  'Makanan & Minuman': '#fb923c',
  'Transportasi': '#60a5fa',
  'Belanja': '#c084fc',
  'Hiburan': '#f472b6',
  'Kesehatan': '#34d399',
  'Pendidikan': '#fbbf24',
  'Tagihan & Utilitas': '#f87171',
  'Lainnya': '#94a3b8',
};

const categoryClass: Record<string, string> = {
  'Makanan & Minuman': 'cat-food',
  'Transportasi': 'cat-transport',
  'Belanja': 'cat-shopping',
  'Hiburan': 'cat-entertainment',
  'Kesehatan': 'cat-health',
  'Pendidikan': 'cat-education',
  'Tagihan & Utilitas': 'cat-bills',
  'Lainnya': 'cat-other',
};

function CategoryInitial({ category }: { category: string }) {
  const color = categoryColors[category] || '#94a3b8';
  const initials: Record<string, string> = {
    'Makanan & Minuman': 'MK',
    'Transportasi': 'TR',
    'Belanja': 'BL',
    'Hiburan': 'HB',
    'Kesehatan': 'KS',
    'Pendidikan': 'PD',
    'Tagihan & Utilitas': 'TG',
    'Lainnya': 'LN',
  };
  return (
    <div style={{
      width: 38,
      height: 38,
      borderRadius: 12,
      background: `${color}18`,
      border: `1px solid ${color}35`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color,
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '0.04em',
      flexShrink: 0,
    }}>
      {initials[category] || 'LN'}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 3h11M4 3V2h5v1M2 3l1 9h7l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TransactionList({ transactions, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) onDeleted();
    } catch (err) {
      console.error('[TransactionList] delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '42px 20px', color: 'var(--text-muted)' }}>
        <div style={{
          width: 56,
          height: 56,
          background: 'rgba(8, 17, 31, 0.58)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="3" y="4" width="14" height="12" rx="2" stroke="#475569" strokeWidth="1.5" />
            <path d="M7 8h6M7 11h4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Belum ada transaksi bulan ini</p>
        <p style={{ fontSize: 12 }}>Mulai catat pengeluaran lewat panel chat di atas</p>
      </div>
    );
  }

  // Group by date
  const grouped = transactions.reduce((acc, t) => {
    const date = t.transaction_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Hari Ini';
    if (dateStr === yesterdayStr) return 'Kemarin';
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sortedDates.map((date) => {
        const dayTotal = grouped[date].reduce((sum, t) => sum + t.amount, 0);
        return (
          <div key={date}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {formatDate(date)}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
                Rp {dayTotal.toLocaleString('id-ID')}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {grouped[date].map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: 'rgba(8, 17, 31, 0.56)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: '13px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    transition: 'all 0.2s ease',
                    opacity: deletingId === t.id ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget).style.borderColor = 'var(--border-light)';
                    (e.currentTarget).style.background = 'rgba(12, 21, 38, 0.84)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget).style.borderColor = 'var(--border)';
                    (e.currentTarget).style.background = 'rgba(8, 17, 31, 0.56)';
                  }}
                >
                  <CategoryInitial category={t.category} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 500,
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 3,
                    }}>
                      {t.description}
                    </p>
                    <span className={`category-badge ${categoryClass[t.category] || 'cat-other'}`} style={{ fontSize: 10 }}>
                      {t.category}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                      Rp {t.amount.toLocaleString('id-ID')}
                    </p>
                    <button
                      id={`delete-transaction-${t.id}`}
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 2,
                        display: 'flex',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget).style.color = '#f87171')}
                      onMouseLeave={(e) => ((e.currentTarget).style.color = 'var(--text-muted)')}
                      aria-label="Hapus transaksi"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
