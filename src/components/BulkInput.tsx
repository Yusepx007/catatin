'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';

type Row = {
  id: number;
  type: 'expense' | 'income';
  description: string;
  amount: string;
  category: string;
  date: string;
};

const today = () => new Date().toISOString().slice(0, 10);
let rowId = 0;

const blankRow = (): Row => ({
  id: ++rowId,
  type: 'expense',
  description: '',
  amount: '',
  category: 'Makanan & Minuman',
  date: today(),
});

type Props = { userId: string; onSaved: () => void };

export default function BulkInput({ userId, onSaved }: Props) {
  const [rows, setRows] = useState<Row[]>([blankRow(), blankRow(), blankRow()]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number } | null>(null);

  const update = (id: number, field: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        // auto-switch category when type changes
        if (field === 'type') {
          updated.category =
            value === 'income' ? 'Gaji & Upah' : 'Makanan & Minuman';
        }
        return updated;
      })
    );
  };

  const addRows = (n: number) => {
    setRows((prev) => [...prev, ...Array.from({ length: n }, blankRow)]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const handleSave = async () => {
    const valid = rows.filter(
      (r) => r.description.trim() && Number(r.amount) > 0 && r.date
    );
    if (valid.length === 0) return;

    setSaving(true);
    setResult(null);

    const inserts = valid.map((r) => ({
      user_id: userId,
      type: r.type,
      category: r.category,
      description: r.description.trim(),
      amount: Number(r.amount),
      transaction_date: r.date,
      raw_text: `${r.description} ${r.amount}`,
    }));

    const { error } = await supabase.from('transactions').insert(inserts);

    setSaving(false);
    if (error) {
      setResult({ ok: 0, fail: valid.length });
    } else {
      setResult({ ok: valid.length, fail: 0 });
      setRows([blankRow(), blankRow(), blankRow()]);
      onSaved();
    }
  };

  const categories = (type: 'expense' | 'income') =>
    type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Isi tabel di bawah — bisa langsung banyak baris sekaligus. Baris kosong akan diabaikan.
        </p>
      </div>

      {/* Result banner */}
      {result && (
        <div style={{
          marginBottom: 14, padding: '12px 16px', borderRadius: 12,
          background: result.fail > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
          border: `1px solid ${result.fail > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
          fontSize: 13, fontWeight: 600,
          color: result.fail > 0 ? '#ef4444' : '#16a34a',
        }}>
          {result.fail > 0
            ? `❌ Gagal menyimpan ${result.fail} transaksi.`
            : `✅ ${result.ok} transaksi berhasil disimpan!`}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
          <thead>
            <tr>
              {['Tipe','Deskripsi','Jumlah (Rp)','Kategori','Tanggal',''].map((h) => (
                <th key={h} style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  textAlign: 'left', padding: '0 8px 6px',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {/* Type */}
                <td style={{ padding: '0 4px' }}>
                  <select
                    value={row.type}
                    onChange={(e) => update(row.id, 'type', e.target.value)}
                    style={{
                      width: 110, padding: '8px 10px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      color: row.type === 'income' ? '#16a34a' : '#ef4444',
                      fontWeight: 700, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </td>

                {/* Description */}
                <td style={{ padding: '0 4px' }}>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => update(row.id, 'description', e.target.value)}
                    placeholder="Contoh: Makan siang"
                    style={{
                      width: 180, padding: '8px 10px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
                    }}
                  />
                </td>

                {/* Amount */}
                <td style={{ padding: '0 4px' }}>
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => update(row.id, 'amount', e.target.value)}
                    placeholder="0"
                    min={1}
                    style={{
                      width: 130, padding: '8px 10px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
                    }}
                  />
                </td>

                {/* Category */}
                <td style={{ padding: '0 4px' }}>
                  <select
                    value={row.category}
                    onChange={(e) => update(row.id, 'category', e.target.value)}
                    style={{
                      width: 170, padding: '8px 10px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      color: 'var(--text-primary)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
                    }}
                  >
                    {categories(row.type).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>

                {/* Date */}
                <td style={{ padding: '0 4px' }}>
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => update(row.id, 'date', e.target.value)}
                    style={{
                      width: 140, padding: '8px 10px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--card-bg)',
                      color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
                    }}
                  />
                </td>

                {/* Remove */}
                <td style={{ padding: '0 4px' }}>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
                      background: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      display: 'grid', placeItems: 'center', fontSize: 14,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#ef4444'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--border)'; }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => addRows(5)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          + 5 Baris
        </button>
        <button
          type="button"
          onClick={() => addRows(10)}
          style={{
            padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--card-bg)', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          + 10 Baris
        </button>

        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {rows.filter((r) => r.description.trim() && Number(r.amount) > 0).length} baris valid
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: 12,
            background: saving ? 'var(--border)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
            color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
            boxShadow: saving ? 'none' : '0 4px 14px rgba(34,197,94,0.3)',
            transition: 'all 0.2s',
          }}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Semua'}
        </button>
      </div>
    </div>
  );
}
