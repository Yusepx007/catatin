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

// Helper: date relative to today
const relDate = (monthsAgo: number, day: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(day);
  return d.toISOString().slice(0, 10);
};

const DEMO_DATA: Omit<Row, 'id'>[] = [
  // Bulan ini
  { type:'income',  description:'Gaji PT Kreasi Digital',         amount:'6000000',  category:'Gaji & Upah',          date: relDate(0,1)  },
  { type:'income',  description:'Desain UI mobile app startup',   amount:'1500000',  category:'Freelance & Proyek',    date: relDate(0,6)  },
  { type:'income',  description:'Return reksadana Bibit',         amount:'180000',   category:'Investasi',             date: relDate(0,14) },
  { type:'expense', description:'Grocery Alfamart mingguan',      amount:'165000',   category:'Makanan & Minuman',     date: relDate(0,4)  },
  { type:'expense', description:'Kopi Fore Coffee harian',        amount:'87500',    category:'Makanan & Minuman',     date: relDate(0,6)  },
  { type:'expense', description:'GrabFood delivery weekend',      amount:'78000',    category:'Makanan & Minuman',     date: relDate(0,12) },
  { type:'expense', description:'Snack & minuman WFH',            amount:'42000',    category:'Makanan & Minuman',     date: relDate(0,15) },
  { type:'expense', description:'Token KRL Jakarta',              amount:'100000',   category:'Transportasi',          date: relDate(0,1)  },
  { type:'expense', description:'Ojek online harian',             amount:'90000',    category:'Transportasi',          date: relDate(0,5)  },
  { type:'expense', description:'Bensin Pertamax full tank',      amount:'70000',    category:'Transportasi',          date: relDate(0,10) },
  { type:'expense', description:'Listrik PLN',                    amount:'295000',   category:'Tagihan & Utilitas',    date: relDate(0,5)  },
  { type:'expense', description:'IndiHome internet',              amount:'350000',   category:'Tagihan & Utilitas',    date: relDate(0,5)  },
  { type:'expense', description:'Pulsa Telkomsel',                amount:'50000',    category:'Tagihan & Utilitas',    date: relDate(0,3)  },
  { type:'expense', description:'Kemeja kerja Brand Local 2 pcs', amount:'298000',   category:'Belanja',               date: relDate(0,8)  },
  { type:'expense', description:'Mouse wireless Logitech',        amount:'199000',   category:'Belanja',               date: relDate(0,13) },
  { type:'expense', description:'Netflix Premium',                amount:'54000',    category:'Hiburan',               date: relDate(0,1)  },
  { type:'expense', description:'Spotify Premium',                amount:'54990',    category:'Hiburan',               date: relDate(0,1)  },
  { type:'expense', description:'Nonton Bioskop XXI 2 tiket',     amount:'80000',    category:'Hiburan',               date: relDate(0,11) },
  { type:'expense', description:'Vitamin C + Zinc suplemen',      amount:'48000',    category:'Kesehatan',             date: relDate(0,4)  },
  { type:'expense', description:'Cicilan laptop Shopee 12x',      amount:'450000',   category:'Paylater & Cicilan',    date: relDate(0,15) },
  { type:'expense', description:'Barbershop + cuci motor',        amount:'65000',    category:'Perawatan Diri',        date: relDate(0,8)  },
  { type:'expense', description:'Infaq masjid + sedekah',         amount:'30000',    category:'Donasi & Sosial',       date: relDate(0,7)  },
  // 1 bulan lalu
  { type:'income',  description:'Gaji PT Kreasi Digital',         amount:'6000000',  category:'Gaji & Upah',          date: relDate(1,1)  },
  { type:'income',  description:'Website company profile UMKM',   amount:'2000000',  category:'Freelance & Proyek',    date: relDate(1,18) },
  { type:'income',  description:'Dividen saham BBCA',             amount:'210000',   category:'Investasi',             date: relDate(1,20) },
  { type:'expense', description:'Grocery bulanan Giant',          amount:'420000',   category:'Makanan & Minuman',     date: relDate(1,3)  },
  { type:'expense', description:'Team lunch restoran padang',     amount:'230000',   category:'Makanan & Minuman',     date: relDate(1,12) },
  { type:'expense', description:'Kopi harian 4 minggu',           amount:'140000',   category:'Makanan & Minuman',     date: relDate(1,28) },
  { type:'expense', description:'GrabFood delivery 5x',           amount:'125000',   category:'Makanan & Minuman',     date: relDate(1,22) },
  { type:'expense', description:'KRL bulanan',                    amount:'100000',   category:'Transportasi',          date: relDate(1,1)  },
  { type:'expense', description:'Ojek online 4 minggu',           amount:'160000',   category:'Transportasi',          date: relDate(1,28) },
  { type:'expense', description:'Bensin motor 2x isi full',       amount:'135000',   category:'Transportasi',          date: relDate(1,14) },
  { type:'expense', description:'Listrik PLN',                    amount:'280000',   category:'Tagihan & Utilitas',    date: relDate(1,5)  },
  { type:'expense', description:'IndiHome internet',              amount:'350000',   category:'Tagihan & Utilitas',    date: relDate(1,5)  },
  { type:'expense', description:'Pulsa Telkomsel',                amount:'50000',    category:'Tagihan & Utilitas',    date: relDate(1,4)  },
  { type:'expense', description:'Sepatu Specs olahraga',          amount:'399000',   category:'Belanja',               date: relDate(1,16) },
  { type:'expense', description:'Buku Rich Dad Poor Dad',         amount:'89000',    category:'Pendidikan',            date: relDate(1,20) },
  { type:'expense', description:'Netflix + Spotify',              amount:'108990',   category:'Hiburan',               date: relDate(1,1)  },
  { type:'expense', description:'Karaoke bersama teman',          amount:'320000',   category:'Hiburan',               date: relDate(1,25) },
  { type:'expense', description:'Periksa dokter + obat',          amount:'175000',   category:'Kesehatan',             date: relDate(1,9)  },
  { type:'expense', description:'Cicilan laptop Shopee',          amount:'450000',   category:'Paylater & Cicilan',    date: relDate(1,15) },
  { type:'expense', description:'Sumbang nikahan teman SMA',      amount:'300000',   category:'Donasi & Sosial',       date: relDate(1,22) },
  // 2 bulan lalu
  { type:'income',  description:'Gaji PT Kreasi Digital',         amount:'6000000',  category:'Gaji & Upah',          date: relDate(2,1)  },
  { type:'income',  description:'Jual laptop lama di OLX',        amount:'3500000',  category:'Penjualan',             date: relDate(2,15) },
  { type:'income',  description:'Freelance ilustrasi konten',     amount:'800000',   category:'Freelance & Proyek',    date: relDate(2,10) },
  { type:'expense', description:'Grocery mingguan x4',            amount:'360000',   category:'Makanan & Minuman',     date: relDate(2,28) },
  { type:'expense', description:'Makan malam Japanese ramen',     amount:'155000',   category:'Makanan & Minuman',     date: relDate(2,14) },
  { type:'expense', description:'GrabFood delivery',              amount:'110000',   category:'Makanan & Minuman',     date: relDate(2,24) },
  { type:'expense', description:'KRL bulanan',                    amount:'100000',   category:'Transportasi',          date: relDate(2,1)  },
  { type:'expense', description:'Bensin full tank 2x',            amount:'135000',   category:'Transportasi',          date: relDate(2,15) },
  { type:'expense', description:'Uber airport jemput teman',      amount:'95000',    category:'Transportasi',          date: relDate(2,27) },
  { type:'expense', description:'Listrik PLN',                    amount:'275000',   category:'Tagihan & Utilitas',    date: relDate(2,5)  },
  { type:'expense', description:'IndiHome internet',              amount:'350000',   category:'Tagihan & Utilitas',    date: relDate(2,5)  },
  { type:'expense', description:'Monitor 24 inch second Tokped',  amount:'1200000',  category:'Belanja',               date: relDate(2,8)  },
  { type:'expense', description:'Keyboard mechanical Rexus',      amount:'350000',   category:'Belanja',               date: relDate(2,8)  },
  { type:'expense', description:'Tiket konser indie',             amount:'350000',   category:'Hiburan',               date: relDate(2,19) },
  { type:'expense', description:'Netflix + Spotify',              amount:'108990',   category:'Hiburan',               date: relDate(2,1)  },
  { type:'expense', description:'Cicilan laptop Shopee',          amount:'450000',   category:'Paylater & Cicilan',    date: relDate(2,15) },
  { type:'expense', description:'Kursus UI/UX Udemy 3 course',   amount:'250000',   category:'Pendidikan',            date: relDate(2,6)  },
  // 3 bulan lalu (Lebaran)
  { type:'income',  description:'Gaji PT Kreasi Digital',         amount:'6000000',  category:'Gaji & Upah',          date: relDate(3,1)  },
  { type:'income',  description:'THR dari kantor 1x gaji',        amount:'6000000',  category:'Bonus & THR',           date: relDate(3,12) },
  { type:'income',  description:'Angpao Lebaran keluarga besar',  amount:'950000',   category:'Hadiah & Hibah',        date: relDate(3,20) },
  { type:'expense', description:'Belanja Lebaran bahan makanan',  amount:'680000',   category:'Makanan & Minuman',     date: relDate(3,8)  },
  { type:'expense', description:'Opor ketupat rendang Lebaran',   amount:'380000',   category:'Makanan & Minuman',     date: relDate(3,19) },
  { type:'expense', description:'Makan malam keluarga besar',     amount:'550000',   category:'Makanan & Minuman',     date: relDate(3,21) },
  { type:'expense', description:'Kue kering & hampers Lebaran',   amount:'320000',   category:'Makanan & Minuman',     date: relDate(3,10) },
  { type:'expense', description:'Tiket kereta mudik PP',          amount:'760000',   category:'Transportasi',          date: relDate(3,4)  },
  { type:'expense', description:'Bensin mobil selama mudik',      amount:'280000',   category:'Transportasi',          date: relDate(3,18) },
  { type:'expense', description:'Listrik PLN',                    amount:'265000',   category:'Tagihan & Utilitas',    date: relDate(3,5)  },
  { type:'expense', description:'IndiHome internet',              amount:'350000',   category:'Tagihan & Utilitas',    date: relDate(3,5)  },
  { type:'expense', description:'Baju Lebaran family 5 stel',     amount:'1250000',  category:'Belanja',               date: relDate(3,7)  },
  { type:'expense', description:'Parcel Lebaran untuk ortu',      amount:'450000',   category:'Belanja',               date: relDate(3,11) },
  { type:'expense', description:'Netflix + Spotify',              amount:'108990',   category:'Hiburan',               date: relDate(3,1)  },
  { type:'expense', description:'Wisata keluarga Prambanan',      amount:'220000',   category:'Hiburan',               date: relDate(3,22) },
  { type:'expense', description:'Cicilan laptop Shopee',          amount:'450000',   category:'Paylater & Cicilan',    date: relDate(3,15) },
  { type:'expense', description:'Zakat fitrah 5 jiwa',            amount:'175000',   category:'Donasi & Sosial',       date: relDate(3,17) },
  { type:'expense', description:'THR ART + parkir langganan',     amount:'350000',   category:'Donasi & Sosial',       date: relDate(3,18) },
  // 4 bulan lalu
  { type:'income',  description:'Gaji PT Kreasi Digital',         amount:'5800000',  category:'Gaji & Upah',          date: relDate(4,1)  },
  { type:'income',  description:'Motion graphic video company',   amount:'1200000',  category:'Freelance & Proyek',    date: relDate(4,22) },
  { type:'expense', description:'Belanja bulanan supermarket',    amount:'398000',   category:'Makanan & Minuman',     date: relDate(4,4)  },
  { type:'expense', description:'Makan tim saat deadline',        amount:'285000',   category:'Makanan & Minuman',     date: relDate(4,28) },
  { type:'expense', description:'Kopi & snack harian 1 bulan',   amount:'180000',   category:'Makanan & Minuman',     date: relDate(4,25) },
  { type:'expense', description:'KRL bulanan',                    amount:'100000',   category:'Transportasi',          date: relDate(4,1)  },
  { type:'expense', description:'Ojek online 4 minggu',           amount:'155000',   category:'Transportasi',          date: relDate(4,28) },
  { type:'expense', description:'Listrik PLN',                    amount:'268000',   category:'Tagihan & Utilitas',    date: relDate(4,5)  },
  { type:'expense', description:'IndiHome internet',              amount:'350000',   category:'Tagihan & Utilitas',    date: relDate(4,5)  },
  { type:'expense', description:'Smartwatch Amazfit GTS',         amount:'699000',   category:'Belanja',               date: relDate(4,22) },
  { type:'expense', description:'Celana jogger Erigo 2 pcs',      amount:'220000',   category:'Belanja',               date: relDate(4,18) },
  { type:'expense', description:'Netflix + Spotify',              amount:'108990',   category:'Hiburan',               date: relDate(4,1)  },
  { type:'expense', description:'Bowling + arcade 3 orang',       amount:'120000',   category:'Hiburan',               date: relDate(4,27) },
  { type:'expense', description:'Medical checkup tahunan klinik', amount:'350000',   category:'Kesehatan',             date: relDate(4,10) },
  { type:'expense', description:'Cicilan laptop Shopee',          amount:'450000',   category:'Paylater & Cicilan',    date: relDate(4,15) },
  { type:'expense', description:'Donasi yayasan anak yatim',      amount:'50000',    category:'Donasi & Sosial',       date: relDate(4,11) },
];

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

  const handleLoadDemoToTable = () => {
    const loadedRows: Row[] = DEMO_DATA.map((d) => ({
      id: ++rowId,
      type: d.type as 'expense' | 'income',
      description: d.description,
      amount: d.amount,
      category: d.category,
      date: d.date,
    }));
    setRows(loadedRows);
  };

  const handleDirectSeedDemo = async () => {
    if (!userId) return;
    setSaving(true);
    setResult(null);

    try {
      // 1. Prepare 5 months of budgets
      const today = new Date();
      const budgetInserts = [0, 1, 2, 3, 4].map((mAgo) => {
        const d = new Date(today.getFullYear(), today.getMonth() - mAgo, 1);
        const monthStr = d.toISOString().slice(0, 7);
        const limit = mAgo <= 1 ? 5000000 : mAgo <= 3 ? 4500000 : 4000000;
        return {
          user_id: userId,
          month: monthStr,
          monthly_limit: limit,
        };
      });

      await supabase.from('budgets').upsert(budgetInserts, { onConflict: 'user_id,month' });

      // 2. Prepare transaction inserts
      const txInserts = DEMO_DATA.map((d) => ({
        user_id: userId,
        type: d.type,
        category: d.category,
        description: d.description,
        amount: Number(d.amount),
        transaction_date: d.date,
        raw_text: `${d.description} ${d.amount}`,
      }));

      // Insert in batch
      const { error } = await supabase.from('transactions').insert(txInserts);

      if (error) {
        setResult({ ok: 0, fail: DEMO_DATA.length });
      } else {
        setResult({ ok: DEMO_DATA.length, fail: 0 });
        setRows([blankRow(), blankRow(), blankRow()]);
        onSaved();
      }
    } catch (err) {
      console.error(err);
      setResult({ ok: 0, fail: DEMO_DATA.length });
    } finally {
      setSaving(false);
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
