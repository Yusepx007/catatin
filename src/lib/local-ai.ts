export type ParsedTransaction = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

type LocalAiCommand = 'parse' | 'insight';

function getRemoteAiUrl(): string | null {
  const url = process.env.PYTHON_AI_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

async function runRemoteAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
  const baseUrl = getRemoteAiUrl();
  if (!baseUrl) {
    throw new Error('PYTHON_AI_URL belum dikonfigurasi.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (process.env.AI_SHARED_SECRET) {
      headers['x-ai-secret'] = process.env.AI_SHARED_SECRET;
    }

    const response = await fetch(`${baseUrl}/${command === 'parse' ? 'parse' : 'insight'}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null) as unknown;

    if (!response.ok) {
      const detail =
        typeof body === 'object' && body !== null && 'detail' in body
          ? String((body as { detail: unknown }).detail)
          : 'AI Python gagal memproses request.';
      throw new Error(detail);
    }

    return body as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI Python terlalu lama merespons. Coba lagi.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function runLocalAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
  const { spawn } = await import('node:child_process');

  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    const scriptPath = 'ai/local_ai.py';
    const child = spawn(pythonBin, [scriptPath, command], {
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error('AI lokal terlalu lama memproses. Coba lagi.'));
    }, 8_000);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error(`Gagal menjalankan Python AI: ${error.message}`));
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      let parsed: unknown;
      try {
        parsed = JSON.parse(stdout.trim());
      } catch {
        reject(new Error(stderr.trim() || 'Output AI lokal tidak valid.'));
        return;
      }

      if (code !== 0) {
        const message =
          typeof parsed === 'object' && parsed !== null && 'error' in parsed
            ? String((parsed as { error: unknown }).error)
            : stderr.trim() || 'AI lokal gagal memproses input.';
        reject(new Error(message));
        return;
      }

      resolve(parsed as T);
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

function runAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
  return getRemoteAiUrl()
    ? runRemoteAi<T>(command, payload)
    : runLocalAi<T>(command, payload);
}

export function parseTransaction(rawText: string): Promise<ParsedTransaction> {
  return runAi<ParsedTransaction>('parse', { rawText });
}

export async function generateWeeklyInsight(
  transactions: Array<{
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
  }>
): Promise<string> {
  const result = await runAi<{ insight: string }>('insight', { transactions });
  return result.insight;
}
