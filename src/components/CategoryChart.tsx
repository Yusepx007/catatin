'use client';

import { CATEGORY_COLORS, CATEGORY_INITIALS, isExpenseCategory } from '@/lib/categories';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type Props = {
  transactions: Array<{ category: string; amount: number }>;
};

const formatCurrency = (val: number) =>
  val >= 1000000
    ? `${(val / 1000000).toFixed(1)}jt`
    : val >= 1000
    ? `${(val / 1000).toFixed(0)}rb`
    : val.toString();

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        <p style={{ color: 'var(--accent-green-light)', fontWeight: 700, fontSize: 14 }}>
          Rp {payload[0].value.toLocaleString('id-ID')}
        </p>
      </div>
    );
  }
  return null;
};

function getCategoryColor(category: string): string {
  return isExpenseCategory(category) ? CATEGORY_COLORS[category] : '#94a3b8';
}

export default function CategoryChart({ transactions }: Props) {
  // Aggregate by category
  const categoryData = transactions.reduce((acc, t) => {
    const existing = acc.find((x) => x.category === t.category);
    if (existing) {
      existing.amount += t.amount;
    } else {
      acc.push({ category: t.category, amount: t.amount });
    }
    return acc;
  }, [] as Array<{ category: string; amount: number }>);

  categoryData.sort((a, b) => b.amount - a.amount);

  if (categoryData.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--text-muted)',
      }}>
        <div style={{
          width: 58,
          height: 58,
          margin: '0 auto 14px',
          borderRadius: 18,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(8, 17, 31, 0.58)',
          border: '1px solid var(--border)',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 18V11M11 18V5M18 18V8" stroke="#7890b2" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>Belum ada data kategori</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Mulai catat pengeluaranmu!</p>
      </div>
    );
  }

  const total = categoryData.reduce((sum, c) => sum + c.amount, 0);
  const chartData = categoryData.map((c) => ({
    name: c.category.split(' ')[0], // Short name for chart
    fullName: c.category,
    amount: c.amount,
  }));

  return (
    <div>
      {/* Bar Chart */}
      <div style={{
        height: 180,
        marginBottom: 24,
        padding: '12px 12px 4px',
        borderRadius: 18,
        background: 'rgba(8, 17, 31, 0.46)',
        border: '1px solid var(--border)',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={28} barGap={4}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getCategoryColor(entry.fullName)}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categoryData.map((cat) => {
          const pct = Math.round((cat.amount / total) * 100);
          const color = getCategoryColor(cat.category);
          return (
            <div key={cat.category} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                background: `${color}18`,
                border: `1px solid ${color}32`,
                display: 'grid',
                placeItems: 'center',
                color,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}>
                {isExpenseCategory(cat.category) ? CATEGORY_INITIALS[cat.category] : 'LN'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cat.category}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>
                    Rp {cat.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}99, ${color})`,
                    }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
