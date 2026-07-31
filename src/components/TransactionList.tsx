'use client';

import { supabase, Transaction } from '@/lib/supabase';
import { CATEGORY_CLASSES, CATEGORY_COLORS, CATEGORY_INITIALS, EXPENSE_CATEGORIES, isExpenseCategory } from '@/lib/categories';
import { useState } from 'react';

type Props = {
  transactions: Transaction[];
  onDeleted: () => void;
};

type DraftTransaction = {
  description: string;
  amount: string;
  category: string;
  transaction_date: string;
};

function CategoryInitial({ category }: { category: string }) {
  const color = isExpenseCategory(category) ? CATEGORY_COLORS[category] : '#94a3b8';
  const initials = isExpenseCategory(category) ? CATEGORY_INITIALS[category] : 'LN';
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
      {initials}
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

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M8.8 1.8l2.4 2.4-6.7 6.7H2.1V8.5l6.7-6.7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export default function TransactionList({ transactions, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftTransaction>({
    description: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    transaction_date: '',
  });

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setDraft({
      description: transaction.description,
      amount: String(transaction.amount),
      category: transaction.category,
      transaction_date: transaction.transaction_date,
    });
  };

  const handleSave = async (transaction: Transaction) => {
    const amount = Number(draft.amount);
    const description = draft.description.trim().replace(/\s+/g, ' ').slice(0, 120);
    const category = isExpenseCategory(draft.category) ? draft.category : 'Lainnya';
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(draft.transaction_date);

    if (!description || !isValidDate || !Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) return;

    const safeAmount = Math.round(amount);
    const id = transaction.id;
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          description,
          raw_text: description,
          amount: safeAmount,
          category,
          transaction_date: draft.transaction_date,
        })
        .eq('id', id)
        .eq('user_id', transaction.user_id);
      if (!error) {
        setEditingId(null);
        onDeleted();
      }
    } catch (err) {
      console.error('[TransactionList] update error:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    if (!confirm('Hapus transaksi ini?')) return;
    const id = transaction.id;
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', transaction.user_id);
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
              {grouped[date].map((t) => {
                const isEditing = editingId === t.id;

                return (
                  <div
                    key={t.id}
                    className={`transaction-row ${isEditing ? 'is-editing' : ''}`}
                    style={{
                      background: 'rgba(8, 17, 31, 0.56)',
                      border: '1px solid var(--border)',
                      borderRadius: 18,
                      padding: '13px 14px',
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
                    {isEditing ? (
                      <>
                        <div className="transaction-edit-grid transaction-edit-grid-main">
                          <input
                            className="input-field"
                            value={draft.description}
                            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                            placeholder="Keterangan transaksi"
                            style={{ padding: '10px 12px', fontSize: 13 }}
                          />
                          <input
                            className="input-field"
                            value={draft.amount}
                            onChange={(event) => setDraft((prev) => ({ ...prev, amount: event.target.value }))}
                            type="number"
                            min={1}
                            placeholder="Nominal"
                            style={{ padding: '10px 12px', fontSize: 13 }}
                          />
                        </div>
                        <div className="transaction-edit-grid transaction-edit-grid-meta">
                          <select
                            className="input-field"
                            value={draft.category}
                            onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))}
                            style={{ padding: '10px 12px', fontSize: 13 }}
                          >
                            {EXPENSE_CATEGORIES.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                          <input
                            className="input-field"
                            value={draft.transaction_date}
                            onChange={(event) => setDraft((prev) => ({ ...prev, transaction_date: event.target.value }))}
                            type="date"
                            style={{ padding: '10px 12px', fontSize: 13 }}
                          />
                        </div>
                        <div className="transaction-edit-actions">
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setEditingId(null)}
                            style={{ padding: '8px 12px', fontSize: 12 }}
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => handleSave(t)}
                            disabled={savingId === t.id}
                            style={{ padding: '8px 12px', fontSize: 12 }}
                          >
                            {savingId === t.id ? 'Menyimpan...' : 'Simpan perubahan'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <CategoryInitial category={t.category} />

                        <div className="transaction-info">
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
                          <span className={`category-badge ${isExpenseCategory(t.category) ? CATEGORY_CLASSES[t.category] : 'cat-other'}`} style={{ fontSize: 10 }}>
                            {t.category}
                          </span>
                        </div>

                        <div className="transaction-amount-block">
                          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                            Rp {t.amount.toLocaleString('id-ID')}
                          </p>
                          <div className="transaction-action-row">
                            <button
                              id={`edit-transaction-${t.id}`}
                              onClick={() => startEdit(t)}
                              style={{
                                background: 'rgba(148, 163, 184, 0.06)',
                                border: '1px solid var(--border)',
                                borderRadius: 999,
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '5px 9px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 11,
                                fontWeight: 700,
                                transition: 'color 0.2s',
                              }}
                              aria-label="Edit transaksi"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              id={`delete-transaction-${t.id}`}
                              onClick={() => handleDelete(t)}
                              disabled={deletingId === t.id}
                              style={{
                                background: 'rgba(248, 113, 113, 0.08)',
                                border: '1px solid rgba(248, 113, 113, 0.16)',
                                borderRadius: 999,
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '5px 9px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 11,
                                fontWeight: 700,
                                transition: 'color 0.2s',
                              }}
                              aria-label="Hapus transaksi"
                            >
                              <TrashIcon />
                              Hapus
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
