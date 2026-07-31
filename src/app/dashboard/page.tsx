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

// Main Component

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'overview' | 'record' | 'history' | 'budget'>('overview');
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyTransactions = transactions.filter(
    (t) => new Date(t.transaction_date) >= oneWeekAgo
  );

  const monthlyTransactions = transactions.filter(
    (t) => t.transaction_date.startsWith(currentMonth)
  );
  const totalSpent = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
  const monthlyLimit = budget?.monthly_limit ?? 1_000_000;

  const fetchData = async (uid: string, month: string) => {
    const [txRes, budgetRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', uid)
        .eq('month', month)
        .single(),
    ]);
    if (txRes.data) setTransactions(txRes.data);
    if (budgetRes.data) setBudget(budgetRes.data);
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
          fetchData(session.user.id, currentMonth),
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
  }, [router, currentMonth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRefresh = () => {
    if (userId) fetchData(userId, currentMonth);
  };
  // Quick stats
  const maxTransaction = monthlyTransactions.length > 0
    ? Math.max(...monthlyTransactions.map((t) => t.amount))
    : 0;
  const avgPerTransaction = monthlyTransactions.length > 0
    ? Math.round(totalSpent / monthlyTransactions.length)
    : 0;
  const busiestDate = (() => {
    if (!monthlyTransactions.length) return '-';
    const byDay = monthlyTransactions.reduce((acc, t) => {
      acc[t.transaction_date] = (acc[t.transaction_date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
    return top
      ? new Date(top[0] + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : '-';
  })();

  const quickStats = [
    { label: 'Total transaksi', value: `${monthlyTransactions.length} transaksi` },
    { label: 'Transaksi terbesar', value: maxTransaction > 0 ? `Rp ${maxTransaction.toLocaleString('id-ID')}` : '-' },
    { label: 'Rata-rata / transaksi', value: avgPerTransaction > 0 ? `Rp ${avgPerTransaction.toLocaleString('id-ID')}` : '-' },
    { label: 'Hari pengeluaran tertinggi', value: busiestDate },
  ];
  // Top category
  const topCategory = (() => {
    if (!monthlyTransactions.length) return null;
    const totals = monthlyTransactions.reduce((acc, t) => {
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
                <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em' }}>Catatin</span>
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
        <div className="dashboard-left">
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
                <p className="section-label" style={{ marginBottom: 12 }}>Ringkasan bulan ini</p>
                <h1 style={{
                  fontSize: 'clamp(1.8rem, 3vw, 2.35rem)',
                  fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  marginBottom: 8,
                }}>
                  Kelola pengeluaran dengan tampilan yang lebih fokus.
                </h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 620, lineHeight: 1.7 }}>
                  Tulis transaksi seperti biasa, lalu pantau ritme belanja, batas budget,
                  dan kategori paling dominan tanpa harus berpindah-pindah tampilan.
                </p>
              </div>

              <div style={{
                minWidth: 220,
                padding: 18,
                borderRadius: 20,
                background: 'rgba(248, 250, 252, 0.9)',
                border: '1px solid var(--border)',
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>Progress budget</p>
                <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6 }}>
                  {Math.round((totalSpent / monthlyLimit) * 100)}%
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                  dari limit bulanan sudah terpakai.
                </p>
              </div>
            </div>

            <div className="metric-grid">
              {quickStats.map((item) => (
                <div key={item.label} className="metric-card">
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>{item.label}</p>
                  <p style={{
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.3,
                  }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
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
                  letterSpacing: '-0.03em',
                  marginBottom: 4,
                }}>
                  {activeTab === 'transactions' ? 'Riwayat pengeluaran bulan ini' : 'Pola belanja per kategori'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {activeTab === 'transactions'
                    ? 'Lihat, rapikan, edit, atau hapus catatan yang sudah tersimpan.'
                    : now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
              </div>

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
              <TransactionList transactions={monthlyTransactions} onDeleted={handleRefresh} />
            ) : (
              <CategoryChart transactions={monthlyTransactions} />
            )}
          </section>
        </div>

        <aside className="dashboard-right" style={{
          display: activeMenu === 'budget' || (activeMenu === 'overview' && (userRole === 'admin' || topCategory)) ? 'flex' : 'none',
        }}>
          {userRole === 'admin' && <AdminUserPanel />}

          <div style={{ display: activeMenu === 'budget' ? 'block' : 'none' }}>
            <BudgetCard
              totalSpent={totalSpent}
              monthlyLimit={monthlyLimit}
              daysInMonth={daysInMonth}
              daysPassed={daysPassed}
              userId={userId}
              currentMonth={currentMonth}
              onBudgetUpdated={handleRefresh}
            />
          </div>

          <section className="surface-card" style={{ padding: 20, display: 'none' }}>
            <div style={{ marginBottom: 16 }}>
              <p className="section-label" style={{ marginBottom: 10 }}>Quick view</p>
              <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>Snapshot pengeluaran</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickStats.map((s) => (
                <div key={s.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'rgba(248, 250, 252, 0.9)',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5 }}>{s.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, textAlign: 'right' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </section>

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
                Kategori terbesar
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
                    Mengambil porsi {topCategory.pct}% dari total bulan ini
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

