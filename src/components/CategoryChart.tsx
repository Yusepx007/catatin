'use client';

import { CATEGORY_COLORS, CATEGORY_INITIALS, isExpenseCategory } from '@/lib/categories';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type Props = {
  transactions: Array<{ category: string; amount: number }>;
};

const formatCurrency = (val: number) =>
  val >= 1_000_000
    ? `${(val / 1_000_000).toFixed(1)}jt`
    : val >= 1_000
    ? `${(val / 1_000).toFixed(0)}rb`
    : val.toString();

function getCategoryColor(category: string): string {
  return isExpenseCategory(category) ? CATEGORY_COLORS[category] : '#94a3b8';
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fullName: string } }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
        fontSize: 13,
      }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
          {payload[0].payload.fullName}
        </p>
        <p style={{ color: 'var(--accent-green-light)', fontWeight: 600 }}>
          Rp {payload[0].value.toLocaleString('id-ID')}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ transactions }: Props) {
  const categoryData = transactions.reduce((acc, t) => {
    const existing = acc.find((x) => x.category === t.category);
    if (existing) existing.amount += t.amount;
    else acc.push({ category: t.category, amount: t.amount });
    return acc;
  }, [] as Array<{ category: string; amount: number }>);

  categoryData.sort((a, b) => b.amount - a.amount);

  if (categoryData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
        <div style={{
          width: 60, height: 60, margin: '0 auto 14px',
          borderRadius: '50%', display: 'grid', placeItems: 'center',
          background: 'var(--border-light)', border: '1px solid var(--border)',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="8" stroke="var(--text-soft)" strokeWidth="1.8"/>
            <circle cx="11" cy="11" r="4" stroke="var(--text-soft)" strokeWidth="1.8"/>
          </svg>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Belum ada data</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Mulai catat pengeluaranmu!</p>
      </div>
    );
  }

  const total = categoryData.reduce((s, c) => s + c.amount, 0);
  const chartData = categoryData.map((c) => ({
    name: c.category.split(' ')[0],
    fullName: c.category,
    amount: c.amount,
    pct: Math.round((c.amount / total) * 100),
  }));

  return (
    <div>
      {/* Donut chart */}
      <div style={{ position: 'relative', height: 180, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={2}
              dataKey="amount"
              strokeWidth={0}
            >
              {chartData.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={getCategoryColor(entry.fullName)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Total</p>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Rp {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categoryData.slice(0, 5).map((cat) => {
          const pct = Math.round((cat.amount / total) * 100);
          const color = getCategoryColor(cat.category);
          return (
            <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Color dot */}
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color, flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.category}
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>
                      Rp {cat.amount.toLocaleString('id-ID')}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 30, textAlign: 'right' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 4 }}>
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                  }} />
                </div>
              </div>
            </div>
          );
        })}
        {categoryData.length > 5 && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 2 }}>
            +{categoryData.length - 5} kategori lainnya
          </p>
        )}
      </div>
    </div>
  );
}
