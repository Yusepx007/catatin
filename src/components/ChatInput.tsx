'use client';

import { CATEGORY_CLASSES, CATEGORY_COLORS, isExpenseCategory } from '@/lib/categories';
import { useState, useRef, useEffect, useCallback } from 'react';

type Message = {
  id: string;
  type: 'user' | 'ai' | 'confirm' | 'success' | 'error';
  content: string;
  rawText?: string;
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

function CategoryDot({ category }: { category: string }) {
  const color = isExpenseCategory(category) ? CATEGORY_COLORS[category] : '#94a3b8';
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

  const addFallbackParsedMessage = async (rawText: string) => {
    const { parseTransactionWithRules } = await import('@/lib/catatin-ai');
    const parsedData = parseTransactionWithRules(rawText);
    addMessage({
      type: 'confirm',
      content: 'Transaksi berhasil dibaca. Apakah datanya sudah benar?',
      rawText,
      parsedData,
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (text.length < 3) {
      addMessage({ type: 'error', content: 'Deskripsi terlalu singkat. Coba lebih detail.' });
      return;
    }

    // Check rate limit
    if (rateLimit && countdown > 0) {
      addMessage({ type: 'error', content: `Tunggu ${countdown} detik sebelum mencoba lagi.` });
      return;
    }

    setInput('');
    addMessage({ type: 'user', content: text });
    setIsLoading(true);

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
        // Extract seconds from error message e.g. "Tunggu sekitar 53 detik"
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
      });

      if (error) throw error;

      addMessage({
        type: 'success',
        content: `Transaksi disimpan - ${message.parsedData.description} (Rp ${message.parsedData.amount.toLocaleString('id-ID')})`,
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

  const examples = [
    'beli mie ayam 15rb tadi siang',
    'naik grab 18000 kemarin',
    'bayar kost 500rb',
  ];

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
      {/* Header */}
      <div style={{
        padding: '18px 22px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(8, 17, 31, 0.38)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.92), rgba(45, 212, 191, 0.84))',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 14px 30px rgba(34, 197, 94, 0.22)',
        }}>
          {/* Chat icon SVG */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Catat Pengeluaran</p>
          <p style={{
            color: countdown > 0 ? '#fbbf24' : isLoading ? 'var(--accent-green)' : 'var(--text-muted)',
            fontSize: 12,
          }}>
            {countdown > 0
              ? `Tunggu ${countdown} detik sebelum kirim lagi`
              : isLoading ? 'Catatin sedang membaca transaksi...'
              : 'Ketik bebas, Catatin yang rapikan'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'linear-gradient(180deg, rgba(8, 17, 31, 0.18), rgba(8, 17, 31, 0.02))',
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeInUp 0.25s ease forwards',
          }}>
            {msg.type === 'user' && (
              <div className="chat-bubble-user">{msg.content}</div>
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
                    background: 'rgba(8, 17, 31, 0.72)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 16,
                    padding: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className={`category-badge ${isExpenseCategory(msg.parsedData.category) ? CATEGORY_CLASSES[msg.parsedData.category] : 'cat-other'}`}>
                        <CategoryDot category={msg.parsedData.category} />
                        {msg.parsedData.category}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--accent-green-light)' }}>
                        Rp {msg.parsedData.amount.toLocaleString('id-ID')}
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
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    id="confirm-transaction-btn"
                    onClick={() => handleConfirm(msg)}
                    disabled={isLoading || savedConfirmIds.has(msg.id)}
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: 13 }}
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
                  background: 'var(--accent-green)',
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
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        background: 'rgba(8, 17, 31, 0.32)',
      }}>
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setInput(ex)}
            style={{
              background: 'rgba(148, 163, 184, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '6px 12px',
              color: 'var(--text-soft)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget).style.color = 'var(--text-secondary)';
              (e.currentTarget).style.borderColor = 'rgba(134, 239, 172, 0.22)';
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

      {/* Rate limit countdown bar */}
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
            <span style={{
              color: '#fbbf24',
              fontSize: 13,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>
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
        padding: '14px',
        display: 'flex',
        gap: 10,
        background: 'rgba(8, 17, 31, 0.56)',
        borderTop: countdown > 0 ? 'none' : '1px solid var(--border)',
      }}>
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={countdown > 0 ? `Tunggu ${countdown} detik...` : 'Contoh: beli nasi goreng 20rb tadi malam'}
          disabled={isLoading || countdown > 0}
          maxLength={500}
          className="input-field"
          style={{
            background: 'rgba(8, 17, 31, 0.84)',
            fontSize: 14,
            opacity: countdown > 0 ? 0.5 : 1,
            cursor: countdown > 0 ? 'not-allowed' : 'text',
          }}
        />
        <button
          id="send-chat-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading || countdown > 0}
          className="btn-primary"
          style={{
            padding: '12px 18px',
            flexShrink: 0,
            opacity: countdown > 0 ? 0.4 : 1,
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
