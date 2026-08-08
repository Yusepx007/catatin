'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
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
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Icons ───────────────────────────────────────────────────────────────────

function IcDashboard() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="1" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="9" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="9" y="9" width="6" height="6" rx="2" stroke="currentColor" strokeWidth="1.5"/></svg>;
}
function IcPencil() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}
function IcList() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcWallet() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M1 7h14M10 10.5h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcInsight() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 0 1 2 7.46V11H6V9.46A4 4 0 0 1 8 2zM6 12h4M7 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcReport() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h10v12H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcCategory() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="4" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 12h4M12 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcAdmin() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcSettings() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.54 11.54l1.42 1.42M3.05 12.95l1.42-1.42M11.54 4.46l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
function IcLogout() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2v10h3M9 10l4-3L9 4M13 7H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcDownload() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5v7M4.2 5.8 7 8.6l2.8-2.8M2 11.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcTrendUp() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3.5-4 2.5 2L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 4H11v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcTrendDown() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4l3.5 4 2.5-2L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 10H11V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcMoon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13.5 10a6.5 6.5 0 0 1-9-9 7 7 0 1 0 9 9z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcSun() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M3.2 3.2l1.4 1.4M10.4 10.4l1.4 1.4M3.2 11.8l1.4-1.4M10.4 4.6l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
}
function IcChart() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="7" width="3" height="6" rx="1" fill="currentColor" opacity="0.5"/><rect x="5.5" y="4" width="3" height="9" rx="1" fill="currentColor" opacity="0.7"/><rect x="10" y="1" width="3" height="12" rx="1" fill="currentColor"/></svg>;
}

// ─── Nav items ────────────────────────────────────────────────────────────────

type MenuKey = 'overview' | 'record' | 'history' | 'budget' | 'insight' | 'report' | 'category' | 'admin' | 'settings';

const NAV_ITEMS: { key: MenuKey; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { key: 'overview',  label: 'Dashboard',  icon: <IcDashboard /> },
  { key: 'record',    label: 'Catat',      icon: <IcPencil /> },
  { key: 'history',   label: 'Transaksi',  icon: <IcList /> },
  { key: 'budget',    label: 'Budget',     icon: <IcWallet /> },
  { key: 'insight',   label: 'Insight',    icon: <IcInsight /> },
  { key: 'report',    label: 'Laporan',    icon: <IcReport /> },
  { key: 'category',  label: 'Kategori',   icon: <IcCategory /> },
  { key: 'admin',     label: 'Admin',      icon: <IcAdmin />, adminOnly: true },
  { key: 'settings',  label: 'Pengaturan', icon: <IcSettings /> },
];

// ─── Month options ─────────────────────────────────────────────────────────────

function getMonthOptions(): string[] {
  const options: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    options.push(`${y}-${m}`);
  }
  return options;
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────

function TrendChart({ transactions }: { transactions: Transaction[] }) {
  // Build last 30 days
  const days: { date: string; label: string; income: number; expense: number; balance: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    days.push({ date: dateStr, label, income: 0, expense: 0, balance: 0 });
  }
  transactions.forEach((t) => {
    const day = days.find((d) => d.date === t.transaction_date);
    if (!day) return;
    if (t.type === 'income') day.income += t.amount;
    else day.expense += t.amount;
  });
  // running balance
  let running = 0;
  days.forEach((d) => { running += d.income - d.expense; d.balance = running; });

  const hasData = days.some((d) => d.income > 0 || d.expense > 0);

  const fmt = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt`
    : v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : String(v);

  return (
    <div className="surface-card" style={{ padding: 20 }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="section-title">Tren Keuangan (30 Hari Terakhir)</p>
          <p className="section-subtitle">Pemasukan, pengeluaran & saldo bersih harian</p>
        </div>
        {!hasData && <span className="badge badge-gray">Belum ada data</span>}
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={days} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={4}/>
            <YAxis tickFormatter={fmt} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={38}/>
            <Tooltip
              contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--shadow-md)' }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 4 }}
              formatter={(v, name) => [`Rp ${Number(v).toLocaleString('id-ID')}`, name === 'income' ? 'Pemasukan' : name === 'expense' ? 'Pengeluaran' : 'Saldo Bersih']}
            />
            <Legend formatter={(v) => v === 'income' ? 'Pemasukan' : v === 'expense' ? 'Pengeluaran' : 'Saldo Bersih'} wrapperStyle={{ fontSize: 12, paddingTop: 8 }}/>
            <Area type="monotone" dataKey="income"   stroke="#22c55e" strokeWidth={2} fill="url(#colorIncome)"  dot={false}/>
            <Area type="monotone" dataKey="expense"  stroke="#f97316" strokeWidth={2} fill="url(#colorExpense)" dot={false}/>
            <Area type="monotone" dataKey="balance"  stroke="#8b5cf6" strokeWidth={2} fill="url(#colorBalance)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          Catat beberapa transaksi untuk melihat tren
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const todayMonth = getCurrentMonth();

  // State
  const [userId, setUserId]         = useState('');
  const [userEmail, setUserEmail]   = useState('');
  const [userName, setUserName]     = useState('');
  const [userRole, setUserRole]     = useState<'admin'|'user'>('user');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget]         = useState<Budget|null>(null);
  const [loading, setLoading]       = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [activeMenu, setActiveMenu] = useState<MenuKey>('overview');
  const [activeTab, setActiveTab]   = useState<'transactions'|'analytics'>('transactions');
  const [chatResetKey, setChatResetKey] = useState(0);
  const [darkMode, setDarkMode]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark mode effect
  useEffect(() => {
    const saved = localStorage.getItem('catatin-theme');
    if (saved === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    localStorage.setItem('catatin-theme', next ? 'dark' : 'light');
  };

  // Derived data
  const now = new Date();
  const [selectedYear, selectedMonthNumber] = selectedMonth.split('-').map(Number);
  const daysInMonth = selectedYear && selectedMonthNumber
    ? new Date(selectedYear, selectedMonthNumber, 0).getDate()
    : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = selectedMonth === todayMonth ? now.getDate() : daysInMonth;
  const selectedMonthLabel = getMonthLabel(selectedMonth);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyTransactions = transactions.filter(
    (t) => new Date(t.transaction_date) >= oneWeekAgo
  );

  const monthlyTransactions = transactions.filter(
    (t) => t.transaction_date.startsWith(selectedMonth)
  );
  const monthlyExpenses = monthlyTransactions.filter((t) => (t.type ?? 'expense') === 'expense');
  const monthlyIncome   = monthlyTransactions.filter((t) => t.type === 'income');

  const totalSpent  = monthlyExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = monthlyIncome.reduce((s, t) => s + t.amount, 0);
  const netBalance  = totalIncome - totalSpent;
  const monthlyLimit = budget?.monthly_limit ?? 1_000_000;
  const budgetPct   = Math.min(Math.round((totalSpent / monthlyLimit) * 100), 100);

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
    ? CATEGORY_COLORS[topCategory.name] : '#94a3b8';

  // Fetch
  const fetchData = useCallback(async (uid: string, month: string) => {
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
  }, []);

  // Initial auth + user profile load
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/'); return; }
        setUserId(session.user.id);
        setUserEmail(session.user.email || '');
        const metaName = String(session.user.user_metadata?.full_name || '').trim();
        const profileRes = await supabase
          .from('profiles').select('full_name,email').eq('user_id', session.user.id).single();
        const profileName = String(profileRes.data?.full_name || '').trim();
        setUserName(profileName || metaName || (session.user.email?.split('@')[0] ?? ''));
        await Promise.allSettled([
          fetchData(session.user.id, selectedMonth),
          fetch('/api/admin/me', { headers: { Authorization: `Bearer ${session.access_token}` } })
            .then((r) => r.ok ? r.json() : null)
            .then((d) => setUserRole(d?.user?.role === 'admin' ? 'admin' : 'user'))
            .catch(() => setUserRole('user')),
        ]);
      } finally {
        setLoading(false);
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch data when selected month changes (after initial load)
  useEffect(() => {
    if (!userId || loading) return;
    fetchData(userId, selectedMonth);
  }, [selectedMonth, userId, fetchData, loading]);

  const handleRefresh = () => { if (userId) fetchData(userId, selectedMonth); };
  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/'); };

  const handleMenuChange = (menu: MenuKey) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
    if (menu === 'record') setChatResetKey((k) => k + 1);
  };

  // Export
  const exportMonthlyTransactions = () => {
    if (!monthlyTransactions.length) return;
    const headers = ['Tanggal','Tipe','Kategori','Keterangan','Nominal','Input Awal','Dibuat'];
    const rows = monthlyTransactions.map((t) => [
      new Date(t.transaction_date + 'T00:00:00').toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }),
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category, t.description,
      `Rp ${t.amount.toLocaleString('id-ID')}`,
      t.raw_text,
      new Date(t.created_at).toLocaleString('id-ID'),
    ]);
    const html = `<html><head><meta charset="UTF-8"/></head><body><table border="1"><caption>Catatin - ${escapeExcelCell(selectedMonthLabel)}</caption><thead><tr>${headers.map((h) => `<th>${escapeExcelCell(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${escapeExcelCell(String(c??''))}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `catatin-${selectedMonth}.xls`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // Page title map
  const pageTitles: Record<MenuKey, string> = {
    overview: 'Dashboard', record: 'Catat Transaksi', history: 'Riwayat & Analitik',
    budget: 'Budget', insight: 'Insight Mingguan', report: 'Laporan Bulanan',
    category: 'Kategori', admin: 'Admin Panel', settings: 'Pengaturan',
  };

  // Loading
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--page-bg)', flexDirection:'column', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTopColor:'var(--accent-green)', borderRadius:'50%' }} className="animate-spin-slow" />
      <p style={{ color:'var(--text-muted)', fontSize:14 }}>Memuat dashboard...</p>
    </div>
  );

  return (
    <div className="app-shell" style={{ background:'var(--page-bg)' }}>

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:39, backdropFilter:'blur(2px)' }} />
      )}

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <Image src="/logo.png" alt="Catatin" width={34} height={34} priority className="logo-clean"
              style={{ width:'100%', height:'100%', objectFit:'contain' }} />
          </div>
          <div>
            <p className="sidebar-brand-name">Catatin</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:1 }}>Finance AI</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.filter((item) => !item.adminOnly || userRole === 'admin').map((item) => (
            <button
              key={item.key}
              className={`sidebar-nav-item ${activeMenu === item.key ? 'active' : ''}`}
              onClick={() => handleMenuChange(item.key)}
              type="button"
            >
              <span className="sidebar-nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="sidebar-nav-divider" />

          <button className="sidebar-nav-item" type="button" onClick={handleSignOut}
            style={{ color:'var(--accent-expense)' }}>
            <span className="sidebar-nav-item-icon"><IcLogout /></span>
            Keluar
          </button>
        </nav>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {(userName || userEmail).slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <p className="sidebar-user-name">{userName || userEmail.split('@')[0]}</p>
            <p className="sidebar-user-role">{userRole === 'admin' ? 'Admin' : 'User'}</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="app-main">

        {/* Topbar */}
        <header className="app-topbar">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display:'none' }}
              className="topbar-icon-btn sidebar-toggle"
              aria-label="Menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            <div>
              <p className="topbar-title">{pageTitles[activeMenu]}</p>
              <p className="topbar-subtitle">
                {now.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                {userName ? ` · ${userName}` : ''}
              </p>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Month selector */}
            <select
              className="topbar-month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih bulan"
            >
              {getMonthOptions().map((m) => (
                <option key={m} value={m}>{getMonthLabel(m)}</option>
              ))}
            </select>

            {/* Dark mode */}
            <button type="button" className="theme-toggle" onClick={toggleDark} aria-label="Toggle dark mode">
              {darkMode ? <IcSun /> : <IcMoon />}
            </button>

            {/* Record CTA */}
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleMenuChange('record')}
              style={{ padding:'8px 14px', fontSize:13 }}
            >
              <IcPencil />
              Catat
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="app-content">

          {/* ══ DASHBOARD (overview) ══ */}
          {activeMenu === 'overview' && (
            <>
              {/* Stats row */}
              <div className="stats-grid">
                {/* Pemasukan */}
                <div className="stat-card">
                  <div className="stat-card-header">
                    <p className="stat-card-label">Total Pemasukan</p>
                    <div className="stat-card-icon stat-icon-green"><IcTrendUp /></div>
                  </div>
                  <div>
                    <p className="stat-card-value">Rp {totalIncome.toLocaleString('id-ID')}</p>
                    <p className="stat-card-sub">{monthlyIncome.length} transaksi • {selectedMonthLabel}</p>
                  </div>
                </div>
                {/* Pengeluaran */}
                <div className="stat-card">
                  <div className="stat-card-header">
                    <p className="stat-card-label">Total Pengeluaran</p>
                    <div className="stat-card-icon stat-icon-orange"><IcTrendDown /></div>
                  </div>
                  <div>
                    <p className="stat-card-value">Rp {totalSpent.toLocaleString('id-ID')}</p>
                    <p className="stat-card-sub">{monthlyExpenses.length} transaksi • {selectedMonthLabel}</p>
                  </div>
                </div>
                {/* Saldo bersih */}
                <div className="stat-card">
                  <div className="stat-card-header">
                    <p className="stat-card-label">Saldo Bersih</p>
                    <div className="stat-card-icon stat-icon-blue">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="stat-card-value" style={{ color: netBalance >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)' }}>
                      {netBalance >= 0 ? '+' : ''}Rp {netBalance.toLocaleString('id-ID')}
                    </p>
                    <p className="stat-card-sub">Pemasukan − Pengeluaran</p>
                  </div>
                </div>
                {/* Budget */}
                <div className="stat-card">
                  <div className="stat-card-header">
                    <p className="stat-card-label">Budget Bulanan</p>
                    <div className="stat-card-icon stat-icon-purple"><IcWallet /></div>
                  </div>
                  <div>
                    <p className="stat-card-value">Rp {monthlyLimit.toLocaleString('id-ID')}</p>
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>Terpakai</span>
                        <span style={{ fontSize:11, fontWeight:700, color: budgetPct >= 90 ? 'var(--accent-expense)' : budgetPct >= 70 ? '#f59e0b' : 'var(--accent-budget)' }}>{budgetPct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width:`${budgetPct}%`,
                          background: budgetPct >= 90
                            ? 'linear-gradient(90deg,#ef4444,#f97316)'
                            : budgetPct >= 70
                            ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                            : 'linear-gradient(90deg,#8b5cf6,#6366f1)',
                        }}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row: Category chart + Recent Tx + Budget card */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 280px', gap:16, alignItems:'start' }} className="dashboard-grid-3">
                {/* Category chart */}
                <div className="surface-card" style={{ padding:20 }}>
                  <div className="section-header">
                    <div>
                      <p className="section-title">Pengeluaran per Kategori</p>
                      <p className="section-subtitle">{selectedMonthLabel}</p>
                    </div>
                    <button className="section-link" type="button" onClick={() => handleMenuChange('history')}>Lihat semua</button>
                  </div>
                  <CategoryChart transactions={monthlyExpenses} />
                </div>

                {/* Recent transactions */}
                <div className="surface-card" style={{ padding:20 }}>
                  <div className="section-header">
                    <div>
                      <p className="section-title">Transaksi Terbaru</p>
                      <p className="section-subtitle">5 terakhir</p>
                    </div>
                    <button className="section-link" type="button" onClick={() => handleMenuChange('history')}>Lihat semua</button>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {monthlyTransactions.slice(0,5).length === 0 ? (
                      <p style={{ color:'var(--text-muted)', fontSize:13, textAlign:'center', padding:'24px 0' }}>Belum ada transaksi</p>
                    ) : monthlyTransactions.slice(0,5).map((t) => {
                      const isIncome = t.type === 'income';
                      const color = isIncome ? '#22c55e' : '#ef4444';
                      return (
                        <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:12, background:'var(--page-bg)', border:'1px solid var(--border)' }}>
                          <div style={{ width:36, height:36, borderRadius:10, background: isIncome ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', color, fontSize:10, fontWeight:800, flexShrink:0 }}>
                            {t.category.slice(0,2).toUpperCase()}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.description}</p>
                            <p style={{ fontSize:11, color:'var(--text-muted)' }}>{t.category} · {new Date(t.transaction_date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</p>
                          </div>
                          <p style={{ fontSize:13, fontWeight:700, color, flexShrink:0 }}>
                            {isIncome ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Budget card */}
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


              {/* 30-day trend chart */}
              <TrendChart transactions={transactions} />


            </>
          )}

          {/* ══ CATAT ══ */}
          {activeMenu === 'record' && (
            <div style={{ minHeight:500 }}>
              <ChatInput onTransactionSaved={handleRefresh} resetKey={chatResetKey} />
            </div>
          )}

          {/* ══ TRANSAKSI / ANALITIK ══ */}
          {activeMenu === 'history' && (
            <div className="surface-card" style={{ padding:24 }}>
              <div className="section-header" style={{ marginBottom:20 }}>
                <div>
                  <p className="section-title" style={{ fontSize:16 }}>
                    {activeTab === 'transactions' ? `Riwayat ${selectedMonthLabel}` : 'Analitik Kategori'}
                  </p>
                  <p className="section-subtitle">
                    {activeTab === 'transactions'
                      ? 'Edit, hapus, atau pantau catatan yang tersimpan.'
                      : 'Breakdown pengeluaran per kategori'}
                  </p>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  {activeTab === 'transactions' && monthlyTransactions.length > 0 && (
                    <>
                      <span className="badge badge-green">+Rp {totalIncome.toLocaleString('id-ID')}</span>
                      <span className="badge badge-orange">-Rp {totalSpent.toLocaleString('id-ID')}</span>
                      <button className="btn-secondary" type="button" onClick={exportMonthlyTransactions} style={{ padding:'7px 12px', fontSize:12 }}>
                        <IcDownload /> Export Excel
                      </button>
                    </>
                  )}
                  <div style={{ display:'flex', gap:4, padding:4, borderRadius:12, background:'var(--page-bg)', border:'1px solid var(--border)' }}>
                    {(['transactions','analytics'] as const).map((tab) => (
                      <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                        style={{ padding:'8px 14px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit', background: activeTab===tab ? 'var(--card-bg)' : 'transparent', color: activeTab===tab ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: activeTab===tab ? 'var(--shadow-xs)' : 'none', display:'flex', alignItems:'center', gap:6, transition:'all 0.15s' }}>
                        {tab === 'transactions' ? <><IcList /> Riwayat</> : <><IcChart /> Analitik</>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {activeTab === 'transactions'
                ? <TransactionList transactions={monthlyTransactions} onDeleted={handleRefresh} monthLabel={selectedMonthLabel} />
                : <CategoryChart transactions={monthlyExpenses} />
              }
            </div>
          )}

          {/* ══ BUDGET ══ */}
          {activeMenu === 'budget' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, alignItems:'start' }}>
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
              <div className="surface-card" style={{ padding:20 }}>
                <p className="section-title" style={{ marginBottom:14 }}>Ringkasan Pengeluaran</p>
                {monthlyExpenses.length === 0
                  ? <p style={{ color:'var(--text-muted)', fontSize:13 }}>Belum ada pengeluaran bulan ini.</p>
                  : (() => {
                      const totals = monthlyExpenses.reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + t.amount;
                        return acc;
                      }, {} as Record<string,number>);
                      return Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([cat, amt]) => (
                        <div key={cat} style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                            <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600 }}>{cat}</span>
                            <span style={{ fontSize:12, color:'var(--text-primary)', fontWeight:700 }}>Rp {amt.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width:`${Math.round((amt/totalSpent)*100)}%`, background:'var(--gradient-green)' }}/>
                          </div>
                        </div>
                      ));
                    })()
                }
              </div>
            </div>
          )}

          {/* ══ INSIGHT ══ */}
          {activeMenu === 'insight' && (
            <div className="surface-card" style={{ padding:24, maxWidth:640 }}>
              <div className="section-header">
                <div>
                  <p className="section-title" style={{ fontSize:16 }}>Insight Mingguan AI</p>
                  <p className="section-subtitle">Analisis pola keuangan 7 hari terakhir</p>
                </div>
              </div>
              <WeeklyInsight transactions={weeklyTransactions} />
            </div>
          )}

          {/* ══ LAPORAN ══ */}
          {activeMenu === 'report' && (
            <div className="surface-card" style={{ padding:24 }}>
              <div className="section-header" style={{ marginBottom:20 }}>
                <div>
                  <p className="section-title" style={{ fontSize:16 }}>Laporan Bulanan — {selectedMonthLabel}</p>
                  <p className="section-subtitle">Ringkasan pemasukan & pengeluaran</p>
                </div>
                <button className="btn-secondary" type="button" onClick={exportMonthlyTransactions}>
                  <IcDownload /> Export Excel
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                <div style={{ padding:20, borderRadius:16, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)' }}>
                  <p style={{ fontSize:12, color:'#16a34a', fontWeight:600, marginBottom:8 }}>TOTAL PEMASUKAN</p>
                  <p style={{ fontSize:26, fontWeight:800, color:'#16a34a', letterSpacing:'-0.02em' }}>Rp {totalIncome.toLocaleString('id-ID')}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{monthlyIncome.length} transaksi</p>
                </div>
                <div style={{ padding:20, borderRadius:16, background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.15)' }}>
                  <p style={{ fontSize:12, color:'#ea580c', fontWeight:600, marginBottom:8 }}>TOTAL PENGELUARAN</p>
                  <p style={{ fontSize:26, fontWeight:800, color:'#ea580c', letterSpacing:'-0.02em' }}>Rp {totalSpent.toLocaleString('id-ID')}</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{monthlyExpenses.length} transaksi</p>
                </div>
              </div>
              <TransactionList transactions={monthlyTransactions} onDeleted={handleRefresh} monthLabel={selectedMonthLabel} />
            </div>
          )}

          {/* ══ KATEGORI ══ */}
          {activeMenu === 'category' && (
            <div className="surface-card" style={{ padding:24 }}>
              <div className="section-header" style={{ marginBottom:20 }}>
                <div>
                  <p className="section-title" style={{ fontSize:16 }}>Analitik Kategori</p>
                  <p className="section-subtitle">Breakdown pengeluaran per kategori — {selectedMonthLabel}</p>
                </div>
              </div>
              <CategoryChart transactions={monthlyExpenses} />
            </div>
          )}

          {/* ══ ADMIN ══ */}
          {activeMenu === 'admin' && userRole === 'admin' && (
            <AdminUserPanel />
          )}

          {/* ══ SETTINGS ══ */}
          {activeMenu === 'settings' && (
            <div className="surface-card" style={{ padding:24, maxWidth:480 }}>
              <p className="section-title" style={{ fontSize:16, marginBottom:18 }}>Pengaturan</p>

              {/* Theme */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>Mode Tampilan</p>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{darkMode ? 'Dark mode aktif' : 'Light mode aktif'}</p>
                </div>
                <button type="button" className="btn-secondary" onClick={toggleDark} style={{ gap:8 }}>
                  {darkMode ? <IcSun /> : <IcMoon />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {/* Account */}
              <div style={{ padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:6 }}>Akun</p>
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>{userEmail}</p>
                <span className="badge badge-green" style={{ marginTop:6 }}>{userRole}</span>
              </div>

              {/* Danger */}
              <div style={{ marginTop:20 }}>
                <button className="btn-danger" type="button" onClick={handleSignOut} style={{ width:'100%', justifyContent:'center', padding:'12px 0' }}>
                  <IcLogout /> Keluar dari akun
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
