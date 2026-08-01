'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  totalSpent: number;
  monthlyLimit: number;
  daysInMonth: number;
  daysPassed: number;
  userId: string;
  currentMonth: string;
  onBudgetUpdated: () => void;
};

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1.5 13h13L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function BudgetCard({
  totalSpent,
  monthlyLimit,
  daysInMonth,
  daysPassed,
  userId,
  currentMonth,
  onBudgetUpdated,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(monthlyLimit.toString());
  const [saving, setSaving] = useState(false);

  const daysRemaining = daysInMonth - daysPassed;
  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const projected = dailyAverage * daysInMonth;
  const pct = Math.min((totalSpent / monthlyLimit) * 100, 100);
  const projectedOverBudget = projected > monthlyLimit;
  const daysBeforeEmpty = dailyAverage > 0
    ? Math.floor((monthlyLimit - totalSpent) / dailyAverage)
    : daysRemaining;
  const willRunOutEarly = daysBeforeEmpty < daysRemaining && dailyAverage > 0 && totalSpent > 0;

  const getBarColor = () => {
    if (pct >= 90) return 'linear-gradient(90deg, #ef4444, #dc2626)';
    if (pct >= 70) return 'linear-gradient(90deg, #f59e0b, #d97706)';
    return 'linear-gradient(90deg, #10b981, #059669)';
  };

  const getBorderColor = () => {
    if (pct >= 90) return 'rgba(239,68,68,0.3)';
    if (pct >= 70) return 'rgba(245,158,11,0.3)';
    return 'var(--border)';
  };

  const getAmountColor = () => {
    if (pct >= 90) return '#f87171';
    if (pct >= 70) return '#fbbf24';
    return 'var(--accent-green-light)';
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(newLimit.replace(/\./g, '').replace(',', '.'));
    if (isNaN(val) || val <= 0 || val > 1_000_000_000) return;
    setSaving(true);
    try {
      await supabase.from('budgets').upsert({
        user_id: userId,
        monthly_limit: val,
        month: currentMonth,
      }, { onConflict: 'user_id,month' });
      onBudgetUpdated();
      setIsEditing(false);
    } catch (err) {
      console.error('[BudgetCard] upsert error:', err);
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Rata-rata / hari', value: `Rp ${Math.round(dailyAverage).toLocaleString('id-ID')}` },
    { label: 'Sisa hari', value: `${daysRemaining} hari` },
    { label: 'Proyeksi bulan ini', value: `Rp ${Math.round(projected).toLocaleString('id-ID')}`, danger: projectedOverBudget },
  ];

  return (
    <div style={{
      background: 'var(--gradient-card)',
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 24,
      padding: 22,
      transition: 'border-color 0.3s ease',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <p className="section-label" style={{ marginBottom: 10 }}>Budget control</p>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, letterSpacing: 0, lineHeight: 1.3 }}>Budget Bulan Ini</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          id="edit-budget-btn"
          onClick={() => setIsEditing(!isEditing)}
          style={{
            background: 'none',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            padding: '5px 10px',
            color: 'var(--text-muted)',
            fontSize: 11,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget).style.color = 'var(--text-secondary)';
            (e.currentTarget).style.borderColor = 'var(--text-muted)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget).style.color = 'var(--text-muted)';
            (e.currentTarget).style.borderColor = 'var(--border-light)';
          }}
        >
          <EditIcon />
          Ubah Limit
        </button>
      </div>

      {/* Edit form */}
      {isEditing && (
        <div style={{
          marginBottom: 14,
          padding: 12,
          background: 'rgba(248, 250, 252, 0.9)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          display: 'flex',
          gap: 8,
          animation: 'fadeInUp 0.25s ease',
        }}>
          <input
            id="budget-limit-input"
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            placeholder="Contoh: 1500000"
            min={1}
            max={1000000000}
            className="input-field"
            style={{ background: '#ffffff', fontSize: 13, padding: '10px 12px' }}
          />
          <button
            id="save-budget-btn"
            onClick={handleSaveBudget}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '9px 14px', fontSize: 13, flexShrink: 0 }}
          >
            {saving ? '...' : 'Simpan'}
          </button>
        </div>
      )}

      {/* Spent vs limit */}
      <div style={{ marginBottom: 14 }}>
        <div className="budget-usage-row">
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.06em', marginBottom: 3 }}>SUDAH DIPAKAI</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 800, color: getAmountColor(), letterSpacing: 0, lineHeight: 1.15 }}>
              Rp {totalSpent.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="budget-limit-box">
            <p style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.06em', marginBottom: 5 }}>LIMIT BULANAN</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Rp {monthlyLimit.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="progress-bar" style={{ height: 10, background: 'rgba(148, 163, 184, 0.12)' }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: getBarColor() }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{Math.round(pct)}% terpakai</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            Sisa: Rp {Math.max(0, monthlyLimit - totalSpent).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="budget-stats-grid">
        {stats.map((s) => (
          <div key={s.label} style={{
            background: 'rgba(248, 250, 252, 0.9)',
            borderRadius: 16,
            padding: '12px 12px',
            border: s.danger ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border)',
          }}>
            <p style={{
              fontWeight: 700,
              fontSize: 11,
              color: s.danger ? '#f87171' : 'var(--text-primary)',
              marginBottom: 3,
              lineHeight: 1.3,
            }}>
              {s.value}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 10, lineHeight: 1.3 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Warning — run out early */}
      {willRunOutEarly && (
        <div style={{
          marginTop: 14,
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.22)',
          borderRadius: 12,
          padding: '11px 14px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          animation: 'fadeInUp 0.35s ease',
        }}>
          <div style={{ color: '#fbbf24', marginTop: 1, flexShrink: 0 }}>
            <AlertIcon />
          </div>
          <div>
            <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: 13, marginBottom: 3 }}>
              Peringatan Budget
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.55 }}>
              Dengan pola belanja saat ini, budget bulan ini diperkirakan habis dalam{' '}
              <strong style={{ color: '#fbbf24' }}>
                {daysBeforeEmpty <= 0 ? 'waktu dekat' : `${daysBeforeEmpty} hari`}
              </strong>
              {daysBeforeEmpty > 0 && daysRemaining > daysBeforeEmpty && (
                <>, sekitar{' '}
                  <strong style={{ color: '#fbbf24' }}>
                    {daysRemaining - daysBeforeEmpty} hari sebelum akhir bulan
                  </strong>
                </>
              )}.
            </p>
          </div>
        </div>
      )}

      {/* Warning — near limit */}
      {pct >= 90 && !willRunOutEarly && (
        <div style={{
          marginTop: 14,
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 12,
          padding: '11px 14px',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <div style={{ color: '#f87171', marginTop: 1, flexShrink: 0 }}>
            <AlertIcon />
          </div>
          <p style={{ color: '#f87171', fontSize: 12, lineHeight: 1.55 }}>
            Budget sudah terpakai {Math.round(pct)}%. Pertimbangkan untuk mengurangi pengeluaran.
          </p>
        </div>
      )}
    </div>
  );
}
