import { spawn } from 'node:child_process';

export type ParsedTransaction = {
  category: string;
  amount: number;
  transaction_date: string;
  description: string;
};

type LocalAiCommand = 'parse' | 'insight';

function runLocalAi<T>(command: LocalAiCommand, payload: unknown): Promise<T> {
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

export function parseTransaction(rawText: string): Promise<ParsedTransaction> {
  return runLocalAi<ParsedTransaction>('parse', { rawText });
}

export async function generateWeeklyInsight(
  transactions: Array<{
    category: string;
    amount: number;
    transaction_date: string;
    description: string;
  }>
): Promise<string> {
  const result = await runLocalAi<{ insight: string }>('insight', { transactions });
  return result.insight;
}
