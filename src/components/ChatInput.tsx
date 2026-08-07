'use client';

import {
  CATEGORY_CLASSES,
  CATEGORY_COLORS,
  INCOME_COLORS,
  isExpenseCategory,
  isIncomeCategory,
  guessIncomeCategory,
  INCOME_CATEGORIES,
} from '@/lib/categories';
import { useState, useRef, useEffect, useCallback } from 'react';

type TransactionMode = 'expense' | 'income';

type Message = {
  id: string;
  type: 'user' | 'ai' | 'confirm' | 'success' | 'error';
  content: string;
  rawText?: string;
  mode?: TransactionMode;
  parsedData?: {
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
  };
};

type Props = {
  onTransactionSaved: () => void;
};

type RateLimit = { seconds: number } | null;

function getCategoryColor(category: string): string {
  if (isExpenseCategory(category)) return CATEGORY_COLORS[category];
  if (isIncomeCategory(category)) return INCOME_COLORS[category];
  return '#94a3b8';
}

function CategoryDot({ category }: { category: string }) {
  const color = getCategoryColor(category);
  return (
    <div style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }} />
  );
}

export default function ChatInput({ onTransactionSaved }: Props) {
  const [mode, setMode] = useState<TransactionMode>('expense');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: 'Selamat datang di Catatin. Ketik pengeluaranmu dalam satu kalimat bebas, contoh:\n\n"beli kopi 25rb tadi pagi"\n"naik grab ke kampus 18000 kemarin"\n"bayar spotify 54rb"',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedConfirmIds, setSavedConfirmIds] = useState<Set<string>>(new Set());
  const [rateLimit, setRateLimit] = useState<RateLimit>(null);
  const [countdown, setCountdown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageIdRef = useRef(1);
  const savedConfirmRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setRateLimit(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const addMessage = (msg: Omit<Message, 'id'>) => {
    const id = `msg-${messageIdRef.current++}`;
    setMessages((prev) => [...prev, { ...msg, id }]);
  };

  const handleModeSwitch = (newMode: TransactionMode) => {
    // Only fire if actually switching to a different mode
    if (newMode === mode) return;
    setMode(newMode);
    setInput('');
    const greetings: Record<TransactionMode, string> = {
      expense: 'Mode pengeluaran aktif. Contoh: "beli kopi 25rb tadi pagi" atau "naik grab 18000 kemarin".',
      income: 'Mode pemasukan aktif. Contoh: "terima gaji 5jt hari ini" atau "freelance desain logo 800rb".',
    };
    addMessage({ type: 'ai', content: greetings[newMode], mode: newMode });
  };

  const parseIncomeLocally = (text: string): Message['parsedData'] => {
    const lower = text.toLowerCase();
    // Amount extraction
    const amounts = [
      { regex: /(\d+(?:[.,]\d+)?)\s*juta/i, mult: 1_000_000 },
      { regex: /(\d+(?:[.,]\d+)?)\s*(?:jt|j\b)/i, mult: 1_000_000 },
      { regex: /(\d+(?:[.,]\d+)?)\s*ribu/i, mult: 1_000 },
      { regex: /(\d+(?:[.,]\d+)?)\s*(?:rb|k\b)/i, mult: 1_000 },
      { regex: /rp\.?\s*(\d[\d.,]*)/i, mult: 1 },
      { regex: /(\d[\d.,]{2,})/i, mult: 1 },
    ];
    let amount = 0;
    for (const { regex, mult } of amounts) {
      const m = lower.match(regex);
      if (m) {
        amount = parseFloat(m[1].replace(/\./g, '').replace(',', '.')) * mult;
        break;
      }
    }

    // Date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    let transaction_date = todayStr;
    if (lower.includes('kemarin')) {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      transaction_date = y.toISOString().split('T')[0];
    }

    const category = guessIncomeCategory(text);
    const description = text.trim().slice(0, 120);

    return { category, amount: Math.round(amount) || 100000, transaction_date, description };
  };

  const addFallbackParsedMessage = async (rawText: string) => {
    if (mode === 'income') {
      const parsedData = parseIncomeLocally(rawText);
      addMessage({ type: 'confirm', content: 'Pemasukan berhasil dibaca. Apakah datanya sudah benar?', rawText, mode, parsedData });
    } else {
      const { parseTransactionWithRules } = await import('@/lib/catatin-ai');
      const parsedData = parseTransactionWithRules(rawText);
      addMessage({ type: 'confirm', content: 'Transaksi berhasil dibaca. Apakah datanya sudah benar?', rawText, mode, parsedData });
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (text.length < 3) {
      addMessage({ type: 'error', content: 'Deskripsi terlalu singkat. Coba lebih detail.' });
      return;
    }
    if (rateLimit && countdown > 0) {
      addMessage({ type: 'error', content: `Tunggu ${countdown} detik sebelum mencoba lagi.` });
      return;
    }

    setInput('');
    addMessage({ type: 'user', content: text, mode });
    setIsLoading(true);

    // For income, use local parsing since the API is expense-only
    if (mode === 'income') {
      try {
        const parsedData = parseIncomeLocally(text);
        addMessage({
          type: 'confirm',
          content: 'Pemasukan berhasil dibaca. Apakah datanya sudah benar?',
          rawText: text,
          mode,
          parsedData,
        });
      } catch {
        addMessage({ type: 'error', content: 'Gagal membaca pemasukan. Coba tulis lebih spesifik.' });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Sesi tidak valid. Silakan masuk kembali.');

      const res = await fetch('/api/parse-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ rawText: text }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 429) {
        const match = (data.error as string).match(/(\d+) detik/);
        const secs = match ? parseInt(match[1]) : 60;
        setRateLimit({ seconds: secs });
        startCountdown(secs);
        addMessage({ type: 'error', content: data.error });
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Parsing gagal');

      addMessage({
        type: 'confirm',
        content: 'Transaksi berhasil diparse. Apakah datanya sudah benar?',
        rawText: text,
        mode,
        parsedData: data.data,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      const isNetworkError =
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('load failed');

      if (isNetworkError) {
        try {
          await addFallbackParsedMessage(text);
          return;
        } catch (fallbackErr: unknown) {
          const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : msg;
          addMessage({ type: 'error', content: fallbackMsg });
          return;
        }
      }

      addMessage({ type: 'error', content: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const markConfirmSaved = (messageId: string, saved: boolean) => {
    if (saved) {
      savedConfirmRef.current.add(messageId);
    } else {
      savedConfirmRef.current.delete(messageId);
    }
    setSavedConfirmIds(new Set(savedConfirmRef.current));
  };

  const handleConfirm = async (message: Message) => {
    if (!message.parsedData || savedConfirmRef.current.has(message.id)) return;
    markConfirmSaved(message.id, true);
    setIsLoading(true);
    const txMode = message.mode ?? 'expense';
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Sesi tidak valid. Silakan masuk kembali.');

      const { error } = await supabase.from('transactions').insert({
        user_id: user.id,
        raw_text: message.rawText || message.parsedData.description,
        category: message.parsedData.category,
        amount: message.parsedData.amount,
        transaction_date: message.parsedData.transaction_date,
        description: message.parsedData.description,
        type: txMode,
      });

      if (error) throw error;

      const label = txMode === 'income' ? 'Pemasukan' : 'Transaksi';
      addMessage({
        type: 'success',
        content: `${label} disimpan - ${message.parsedData.description} (Rp ${message.parsedData.amount.toLocaleString('id-ID')})`,
      });
      onTransactionSaved();
    } catch (err: unknown) {
      markConfirmSaved(message.id, false);
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
      addMessage({ type: 'error', content: `Gagal menyimpan: ${msg}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    addMessage({ type: 'ai', content: 'Coba ketik ulang dengan deskripsi yang lebih lengkap.' });
  };

  const expenseExamples = ['beli mie ayam 15rb siang ini', 'naik grab 18000 kemarin', 'bayar kost 500rb'];
  const incomeExamples = ['terima gaji 5jt hari ini', 'freelance desain logo 800rb', 'bonus kerja 1jt'];
  const examples = mode === 'income' ? incomeExamples : expenseExamples;

  const isExpenseMode = mode === 'expense';
  const accentColor = isExpenseMode ? 'var(--accent-green)' : '#818cf8';
  const accentGradient = isExpenseMode
    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.92), rgba(45, 212, 191, 0.84))'
    : 'linear-gradient(135deg, rgba(129, 140, 248, 0.92), rgba(99, 102, 241, 0.84))';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--gradient-card)',
      border: '1px solid var(--border)',
      borderRadius: 24,
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      {/* Mode Tabs */}
      <div style={{
        display: 'flex',
        padding: '12px 14px 0',
        gap: 6,
        background: 'rgba(248, 250, 252, 0.9)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 4,
          gap: 4,
          flex: 1,
        }}>
          {(['expense', 'income'] as const).map((m) => (
            <button
              key={m}
              id={`mode-tab-${m}`}
              type="button"
              onClick={() => handleModeSwitch(m)}
              style={{
                flex: 1,
                padding: '9px 14px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                background: mode === m
                  ? (m === 'expense' ? 'rgba(34,197,94,0.12)' : 'rgba(129,140,248,0.12)')
                  : 'transparent',
                color: mode === m
                  ? (m === 'expense' ? 'var(--accent-green-light)' : '#6366f1')
                  : 'var(--text-muted)',
                boxShadow: mode === m ? '0 6px 18px rgba(15,23,42,0.08)' : 'none',
              }}
              aria-pressed={mode === m}
            >
              {m === 'expense' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v11M1 6.5l5.5 5.5L12 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Pengeluaran
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 12V1M1 6.5l5.5-5.5L12 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Pemasukan
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(248, 250, 252, 0.9)',
      }}>
        <div style={{
          width: 38,
          height: 38,
          background: accentGradient,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 10px 26px ${isExpenseMode ? 'rgba(34, 197, 94, 0.22)' : 'rgba(99, 102, 241, 0.22)'}`,
          transition: 'all 0.3s ease',
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 1 }}>
            {isExpenseMode ? 'Catat Pengeluaran' : 'Catat Pemasukan'}
          </p>
          <p style={{
            color: countdown > 0 ? '#fbbf24' : isLoading ? accentColor : 'var(--text-muted)',
            fontSize: 12,
            transition: 'color 0.2s',
          }}>
            {countdown > 0
              ? `Tunggu ${countdown} detik sebelum kirim lagi`
              : isLoading ? 'Catatin sedang membaca...'
              : 'Ketik bebas, Catatin yang rapikan'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0.96))',
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeInUp 0.25s ease forwards',
          }}>
            {msg.type === 'user' && (
              <div className="chat-bubble-user" style={{
                background: msg.mode === 'income'
                  ? 'rgba(129, 140, 248, 0.14)'
                  : undefined,
                borderColor: msg.mode === 'income'
                  ? 'rgba(129, 140, 248, 0.2)'
                  : undefined,
                color: msg.mode === 'income' ? '#4338ca' : undefined,
              }}>
                {msg.content}
              </div>
            )}

            {(msg.type === 'ai' || msg.type === 'success' || msg.type === 'error') && (
              <div className="chat-bubble-ai" style={{
                borderColor: msg.type === 'success' ? 'rgba(16,185,129,0.3)'
                  : msg.type === 'error' ? 'rgba(239,68,68,0.3)' : undefined,
                background: msg.type === 'success' ? 'rgba(16,185,129,0.06)'
                  : msg.type === 'error' ? 'rgba(239,68,68,0.06)' : undefined,
              }}>
                <p style={{ whiteSpace: 'pre-line', lineHeight: 1.65, fontSize: 14 }}>
                  {msg.content}
                </p>
              </div>
            )}

            {msg.type === 'confirm' && msg.parsedData && (
              <div style={{ maxWidth: '92%' }}>
                <div className="chat-bubble-ai" style={{ marginBottom: 8 }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
                    {msg.content}
                  </p>
                  {/* Result card */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.92)',
                    border: `1px solid ${msg.mode === 'income' ? 'rgba(129,140,248,0.25)' : 'var(--border-light)'}`,
                    borderRadius: 16,
                    padding: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      {msg.mode === 'income' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: 'rgba(129,140,248,0.1)',
                          color: '#6366f1',
                          border: '1px solid rgba(129,140,248,0.2)',
                        }}>
                          <CategoryDot category={msg.parsedData.category} />
                          {msg.parsedData.category}
                        </span>
                      ) : (
                        <span className={`category-badge ${isExpenseCategory(msg.parsedData.category) ? CATEGORY_CLASSES[msg.parsedData.category] : 'cat-other'}`}>
                          <CategoryDot category={msg.parsedData.category} />
                          {msg.parsedData.category}
                        </span>
                      )}
                      <span style={{
                        fontWeight: 800,
                        fontSize: 17,
                        color: msg.mode === 'income' ? '#6366f1' : 'var(--accent-green-light)',
                      }}>
                        {msg.mode === 'income' ? '+' : ''}Rp {msg.parsedData.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 2, letterSpacing: '0.05em' }}>KETERANGAN</p>
                        <p style={{ fontSize: 13 }}>{msg.parsedData.description}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 2, letterSpacing: '0.05em' }}>TANGGAL</p>
                        <p style={{ fontSize: 13 }}>
                          {new Date(msg.parsedData.transaction_date + 'T00:00:00').toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {/* Editable category for income */}
                    {msg.mode === 'income' && (
                      <div style={{ marginTop: 12 }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 10, marginBottom: 4, letterSpacing: '0.05em' }}>KATEGORI PEMASUKAN</p>
                        <select
                          className="input-field"
                          defaultValue={msg.parsedData.category}
                          onChange={(e) => { msg.parsedData!.category = e.target.value; }}
                          style={{ padding: '8px 10px', fontSize: 12 }}
                        >
                          {INCOME_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    id="confirm-transaction-btn"
                    onClick={() => handleConfirm(msg)}
                    disabled={isLoading || savedConfirmIds.has(msg.id)}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      padding: '10px 14px',
                      fontSize: 13,
                      background: savedConfirmIds.has(msg.id)
                        ? 'rgba(100,116,139,0.1)'
                        : msg.mode === 'income'
                        ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                        : 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 12,
                      cursor: savedConfirmIds.has(msg.id) ? 'default' : 'pointer',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    {savedConfirmIds.has(msg.id) ? 'Tersimpan' : 'Simpan'}
                  </button>
                  <button
                    id="reject-transaction-btn"
                    onClick={handleReject}
                    disabled={isLoading || savedConfirmIds.has(msg.id)}
                    className="btn-secondary"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: 13 }}
                  >
                    Ketik Ulang
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble-ai" style={{ alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: isExpenseMode ? 'var(--accent-green)' : '#818cf8',
                  opacity: 0.7,
                  animation: `pulse-glow 1.2s ease ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick examples */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        background: 'rgba(248, 250, 252, 0.86)',
      }}>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setInput(ex)}
            style={{
              background: 'rgba(148, 163, 184, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '5px 10px',
              color: 'var(--text-soft)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              const accent = isExpenseMode ? 'rgba(134, 239, 172, 0.22)' : 'rgba(129, 140, 248, 0.22)';
              (e.currentTarget).style.color = 'var(--text-secondary)';
              (e.currentTarget).style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget).style.color = 'var(--text-soft)';
              (e.currentTarget).style.borderColor = 'var(--border)';
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Rate limit bar */}
      {countdown > 0 && rateLimit && (
        <div style={{
          padding: '8px 14px',
          background: 'rgba(245,158,11,0.06)',
          borderTop: '1px solid rgba(245,158,11,0.18)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 500 }}>
              Batas request tercapai. Tunggu sebelum kirim lagi.
            </span>
            <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {countdown}s
            </span>
          </div>
          <div style={{ height: 3, background: 'rgba(245,158,11,0.15)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: '#fbbf24',
              borderRadius: 2,
              width: `${(countdown / rateLimit.seconds) * 100}%`,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 14px',
        display: 'flex',
        gap: 10,
        background: 'rgba(248, 250, 252, 0.9)',
        borderTop: countdown > 0 ? 'none' : '1px solid var(--border)',
      }}>
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={
            countdown > 0
              ? `Tunggu ${countdown} detik...`
              : isExpenseMode
              ? 'Contoh: beli nasi goreng 20rb tadi malam'
              : 'Contoh: terima gaji 5jt hari ini'
          }
          disabled={isLoading || countdown > 0}
          maxLength={500}
          className="input-field"
          style={{
            background: '#ffffff',
            fontSize: 14,
            opacity: countdown > 0 ? 0.5 : 1,
            cursor: countdown > 0 ? 'not-allowed' : 'text',
            borderColor: !isExpenseMode && input ? 'rgba(129,140,248,0.4)' : undefined,
          }}
        />
        <button
          id="send-chat-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || countdown > 0}
          style={{
            background: countdown > 0 ? 'rgba(100,116,139,0.2)' : accentGradient,
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '12px 18px',
            flexShrink: 0,
            cursor: !input.trim() || isLoading || countdown > 0 ? 'not-allowed' : 'pointer',
            opacity: (!input.trim() || countdown > 0) ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: isExpenseMode
              ? '0 8px 20px rgba(34,197,94,0.25)'
              : '0 8px 20px rgba(99,102,241,0.25)',
          }}
          aria-label="Kirim"
        >
          {countdown > 0 ? (
            <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{countdown}s</span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8H2M14 8L9 3M14 8L9 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
