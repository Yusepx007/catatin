'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase, Transaction, Budget } from '@/lib/supabase';
import ChatInput from '@/components/ChatInput';
import CategoryChart from '@/components/CategoryChart';
import BudgetCard from '@/components/BudgetCard';
import WeeklyInsight from '@/components/WeeklyInsight';
import TransactionList from '@/components/TransactionList';
import AdminUserPanel from '@/components/AdminUserPanel';
import { CATEGORY_COLORS, isExpenseCategory } from '@/lib/categories';

// SVG Icons

function LogoMark() {
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      overflow: 'hidden',
      background: 'transparent',
      border: 0,
      boxShadow: 'none',
      flexShrink: 0,
    }}>
      <Image
        src="/logo.png"
        alt="Catatin"
        width={42}
        height={42}
        priority
        className="logo-clean"
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="7" width="3" height="6" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="5.5" y="4" width="3" height="9" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="10" y="1" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M5 2H2v9h3M9 9l3-2.5L9 4M13 6.5H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5v7M4.2 5.8 7 8.6l2.8-2.8M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 10l3.5-4 2.5 2L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 4H11v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrendDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4l3.5 4 2.5-2L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 10H11V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getCurrentMonth(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
}

function getMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return 'Bulan dipilih';
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });
}

function escapeExcelCell(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Main Component

export default function DashboardPage() {
  const router = useRouter();
  const todayMonth = getCurrentMonth();
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [activeMenu, setActiveMenu] = useState<'overview' | 'record' | 'history' | 'budget'>('overview');
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');

  const now = new Date();
  const [selectedYear, selectedMonthNumber] = selectedMonth.split('-').map(Number);
  const daysInMonth = selectedYear && selectedMonthNumber
    ? new Date(selectedYear, selectedMonthNumber, 0).getDate()
    : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = selectedMonth === todayMonth ? now.getDate() : daysInMonth;
  const selectedMonthLabel = getMonthLabel(selectedMonth);
  const isCurrentMonth = selectedMonth === todayMonth;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyTransactions = transactions.filter(
    (t) => new Date(t.transaction_date) >= oneWeekAgo
  );

  const monthlyTransactions = transactions.filter(
    (t) => t.transaction_date.startsWith(selectedMonth)
  );

  // Separate expense and income
  const monthlyExpenses = monthlyTransactions.filter(t => (t.type ?? 'expense') === 'expense');
  const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income');

  const totalSpent = monthlyExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = monthlyIncome.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalSpent;
  const monthlyLimit = budget?.monthly_limit ?? 1_000_000;

  const fetchData = async (uid: string, month: string) => {
    const [txRes, budgetRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1000),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', uid)
        .eq('month', month)
        .single(),
    ]);
    if (txRes.data) setTransactions(txRes.data);
    setBudget(budgetRes.data ?? null);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/'); return; }
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        const metadataName = String(session.user.user_metadata?.full_name || '').trim();
        const profileRes = await supabase
          .from('profiles')
          .select('full_name,email')
          .eq('user_id', session.user.id)
          .single();
        const profileName = String(profileRes.data?.full_name || '').trim();
        setUserName(
          profileName ||
          metadataName ||
          (session.user.email ? session.user.email.split('@')[0] : '')
        );
        await Promise.allSettled([
          fetchData(session.user.id, selectedMonth),
          fetch('/api/admin/me', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              setUserRole(data?.user?.role === 'admin' ? 'admin' : 'user');
            })
            .catch(() => setUserRole('user')),
        ]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router, selectedMonth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRefresh = () => {
    if (userId) fetchData(userId, selectedMonth);
  };

  const exportMonthlyTransactions = () => {
    if (!monthlyTransactions.length) return;

    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal', 'Input Awal', 'Dibuat'];
    const rows = monthlyTransactions.map((transaction) => [
      new Date(transaction.transaction_date + 'T00:00:00').toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      transaction.category,
      transaction.description,
      `Rp ${transaction.amount.toLocaleString('id-ID')}`,
      transaction.raw_text,
      new Date(transaction.created_at).toLocaleString('id-ID'),
    ]);

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table border="1">
            <caption>Catatin - ${escapeExcelCell(selectedMonthLabel)}</caption>
            <thead>
              <tr>${headers.map((header) => `<th>${escapeExcelCell(header)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeExcelCell(String(cell ?? ''))}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catatin-${selectedMonth}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick stats
  const maxTransaction = monthlyTransactions.length > 0
    ? Math.max(...monthlyTransactions.map((t) => t.amount))
    : 0;
  const avgPerTransaction = monthlyExpenses.length > 0
    ? Math.round(totalSpent / monthlyExpenses.length)
    : 0;
  const busiestDate = (() => {
    if (!monthlyExpenses.length) return '-';
    const byDay = monthlyExpenses.reduce((acc, t) => {
      acc[t.transaction_date] = (acc[t.transaction_date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
    return top
      ? new Date(top[0] + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : '-';
  })();

  const quickStats = [
    { label: 'Total pengeluaran', value: `${monthlyExpenses.length} transaksi`, sub: totalSpent > 0 ? `Rp ${totalSpent.toLocaleString('id-ID')}` : null, color: '#ef4444', icon: <IconTrendDown /> },
    { label: 'Total pemasukan', value: `${monthlyIncome.length} transaksi`, sub: totalIncome > 0 ? `Rp ${totalIncome.toLocaleString('id-ID')}` : null, color: '#22c55e', icon: <IconTrendUp /> },
    { label: 'Pengeluaran terbesar', value: maxTransaction > 0 ? `Rp ${maxTransaction.toLocaleString('id-ID')}` : '-', color: 'var(--text-primary)' },
    { label: 'Rata-rata / pengeluaran', value: avgPerTransaction > 0 ? `Rp ${avgPerTransaction.toLocaleString('id-ID')}` : '-', color: 'var(--text-primary)' },
    { label: 'Hari pengeluaran tertinggi', value: busiestDate, color: 'var(--text-primary)' },
  ];

  // Top category (expense)
  const topCategory = (() => {
    if (!monthlyExpenses.length) return null;
    const totals = monthlyExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    const [name, amount] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
    return { name, amount, pct: Math.round((amount / totalSpent) * 100) };
  })();

  const topCategoryColor = topCategory && isExpenseCategory(topCategory.name)
    ? CATEGORY_COLORS[topCategory.name]
    : '#94a3b8';

  // Loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent-green)',
          borderRadius: '50%',
        }} className="animate-spin-slow" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Memuat dashboard...</p>
      </div>
    );
  }

  // Render
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="dashboard-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        background: 'rgba(255, 255, 255, 0.84)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="dashboard-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <LogoMark />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0 }}>Catatin</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(134, 239, 172, 0.12)',
                  color: 'var(--accent-green-light)',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  Dashboard
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                {userName ? ` - ${userName}` : userEmail ? ` - ${userEmail}` : ''}
              </span>
            </div>
          </div>

          <nav className="dashboard-menu" aria-label="Menu dashboard">
            {[
              ['overview', 'Ringkasan'],
              ['record', 'Catat'],
              ['history', 'Riwayat & Analitik'],
              ['budget', 'Budget'],
            ].map(([menu, label]) => (
              <button
                key={menu}
                type="button"
                className={`dashboard-menu-btn ${activeMenu === menu ? 'active' : ''}`}
                onClick={() => setActiveMenu(menu as typeof activeMenu)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="dashboard-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveMenu('record')}
              className="btn-primary"
              style={{ padding: '10px 14px', fontSize: 13 }}
            >
              Catat transaksi
            </button>

            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              className="btn-secondary"
              style={{ padding: '10px 14px', fontSize: 13 }}
            >
              <IconLogout />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-main">
        <div className="dashboard-period-toolbar">
          <div>
            <span>Periode laporan</span>
            <strong>{selectedMonthLabel}</strong>
          </div>
          <div className="month-control-panel">
            <label htmlFor="month-filter">Bulan yang dilihat</label>
            <input
              id="month-filter"
              type="month"
              value={selectedMonth}
              max={todayMonth}
              onChange={(event) => setSelectedMonth(event.target.value || todayMonth)}
              className="input-field"
            />
            <button
              type="button"
              onClick={exportMonthlyTransactions}
              disabled={!monthlyTransactions.length}
              className="btn-secondary"
            >
              <IconDownload />
              Export Excel
            </button>
          </div>
        </div>

        <div className="dashboard-left">
          {/* ---- OVERVIEW ---- */}
          <section className="surface-card" style={{ padding: 24, display: activeMenu === 'overview' ? 'block' : 'none' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 18,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}>
              <div>
                <p className="section-label" style={{ marginBottom: 12 }}>
                  {isCurrentMonth ? 'Ringkasan bulan ini' : `Ringkasan ${selectedMonthLabel}`}
                </p>
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.35rem)',
                  fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                  fontWeight: 800,
                  letterSpacing: 0,
                  lineHeight: 1.18,
                  marginBottom: 8,
                }}>
                  Kelola keuangan {isCurrentMonth ? 'bulan ini' : selectedMonthLabel} dalam satu tempat.
                </h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 620, lineHeight: 1.7 }}>
                  Catat pemasukan dan pengeluaran, pantau budget, dan lihat pola keuanganmu tanpa harus berpindah aplikasi.
                </p>
              </div>

              {/* Net balance card */}
              <div style={{
                minWidth: 220,
                padding: 18,
                borderRadius: 20,
                background: netBalance >= 0
                  ? 'rgba(240, 253, 244, 0.9)'
                  : 'rgba(254, 242, 242, 0.9)',
                border: netBalance >= 0
                  ? '1px solid rgba(134, 239, 172, 0.22)'
                  : '1px solid rgba(248, 113, 113, 0.22)',
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>Saldo bersih bulan ini</p>
                <p style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: 0,
                  lineHeight: 1.15,
                  marginBottom: 6,
                  color: netBalance >= 0 ? '#16a34a' : '#ef4444',
                }}>
                  {netBalance >= 0 ? '+' : ''}Rp {Math.abs(netBalance).toLocaleString('id-ID')}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <p style={{ color: '#16a34a', fontSize: 12 }}>
                    Masuk: Rp {totalIncome.toLocaleString('id-ID')}
                  </p>
                  <p style={{ color: '#ef4444', fontSize: 12 }}>
                    Keluar: Rp {totalSpent.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="metric-grid">
              {quickStats.map((item) => (
                <div key={item.label} className="metric-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    {item.icon && (
                      <span style={{ color: item.color }}>{item.icon}</span>
                    )}
                    <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{item.label}</p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0, lineHeight: 1.3, color: item.color || 'var(--text-primary)' }}>
                    {item.value}
                  </p>
                  {item.sub && (
                    <p style={{ fontWeight: 800, fontSize: 14, color: item.color, marginTop: 2 }}>
                      {item.sub}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Budget progress inline */}
            {monthlyExpenses.length > 0 && (
              <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 16, background: 'rgba(248,250,252,0.9)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Progress budget pengeluaran</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: totalSpent >= monthlyLimit * 0.9 ? '#ef4444' : 'var(--accent-green-light)' }}>
                    {Math.round((totalSpent / monthlyLimit) * 100)}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((totalSpent / monthlyLimit) * 100, 100)}%`,
                      background: totalSpent >= monthlyLimit * 0.9
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : totalSpent >= monthlyLimit * 0.7
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rp {totalSpent.toLocaleString('id-ID')}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Limit: Rp {monthlyLimit.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </section>

          <div style={{ display: activeMenu === 'overview' ? 'block' : 'none' }}>
            <WeeklyInsight transactions={weeklyTransactions} />
          </div>

          <div style={{ minHeight: 500, display: activeMenu === 'record' ? 'block' : 'none' }}>
            <ChatInput onTransactionSaved={handleRefresh} />
          </div>

          <section className="surface-card" style={{ padding: 22, display: activeMenu === 'history' ? 'block' : 'none' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              marginBottom: 20,
            }}>
              <div>
                <p className="section-label" style={{ marginBottom: 10 }}>
                  {activeTab === 'transactions' ? 'Riwayat transaksi' : 'Analitik kategori'}
                </p>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                  letterSpacing: 0,
                  lineHeight: 1.25,
                  marginBottom: 4,
                }}>
                  {activeTab === 'transactions' ? `Riwayat ${selectedMonthLabel}` : 'Pola belanja per kategori'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {activeTab === 'transactions'
                    ? 'Lihat, rapikan, edit, atau hapus catatan yang sudah tersimpan.'
                    : selectedMonthLabel}
                </p>
              </div>

              {/* Summary pills */}
              {activeTab === 'transactions' && monthlyTransactions.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: 'rgba(34,197,94,0.09)',
                    border: '1px solid rgba(134,239,172,0.2)',
                    color: '#16a34a',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    Masuk: +Rp {totalIncome.toLocaleString('id-ID')}
                  </span>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    Keluar: -Rp {totalSpent.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: 6,
                padding: 4,
                borderRadius: 16,
                background: 'rgba(248, 250, 252, 0.9)',
                border: '1px solid var(--border)',
              }}>
                {(['transactions', 'analytics'] as const).map((tab) => (
                  <button
                    key={tab}
                    id={`tab-${tab}-btn`}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '9px 14px',
                      minWidth: 122,
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: activeTab === tab ? '#ffffff' : 'transparent',
                      color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: activeTab === tab ? '0 10px 26px rgba(15,23,42,0.08)' : 'none',
                    }}
                  >
                    {tab === 'transactions' ? <><IconList /> Riwayat</> : <><IconChart /> Analitik</>}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'transactions' ? (
              <TransactionList
                transactions={monthlyTransactions}
                onDeleted={handleRefresh}
                monthLabel={selectedMonthLabel}
              />
            ) : (
              <CategoryChart transactions={monthlyExpenses} />
            )}
          </section>
        </div>

        <aside className="dashboard-right" style={{
          display: activeMenu === 'budget' || (activeMenu === 'overview' && (userRole === 'admin' || topCategory)) ? 'flex' : 'none',
        }}>
          {userRole === 'admin' && <AdminUserPanel />}

          <div style={{ display: activeMenu === 'budget' ? 'block' : 'none' }}>
            <BudgetCard
              key={selectedMonth}
              totalSpent={totalSpent}
              totalIncome={totalIncome}
              monthlyLimit={monthlyLimit}
              daysInMonth={daysInMonth}
              daysPassed={daysPassed}
              userId={userId}
              currentMonth={selectedMonth}
              monthLabel={selectedMonthLabel}
              onBudgetUpdated={handleRefresh}
            />
          </div>

          {topCategory && (
            <section style={{
              background: 'linear-gradient(180deg, rgba(255, 251, 235, 0.96), rgba(255, 255, 255, 0.98))',
              border: '1px solid rgba(245, 158, 11, 0.22)',
              borderRadius: 24,
              padding: 22,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{
                color: '#fbbf24',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.12em',
                marginBottom: 14,
                textTransform: 'uppercase',
              }}>
                Kategori pengeluaran terbesar
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: `${topCategoryColor}20`,
                  border: `1px solid ${topCategoryColor}38`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  color: topCategoryColor,
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                }}>
                  {topCategory.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{topCategory.name}</p>
                  <p className="gradient-text-gold" style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>
                    Rp {topCategory.amount.toLocaleString('id-ID')}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    Mengambil porsi {topCategory.pct}% dari total pengeluaran
                  </p>
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
