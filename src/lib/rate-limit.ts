type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 2_000;
let lastCleanup = 0;

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanup < 30_000) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  if (buckets.size <= MAX_BUCKETS) return;

  const oldest = [...buckets.entries()]
    .sort((a, b) => a[1].resetAt - b[1].resetAt)
    .slice(0, buckets.size - MAX_BUCKETS);

  for (const [key] of oldest) {
    buckets.delete(key);
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: true } | { allowed: false; retryAfter: number } {
  const now = Date.now();
  cleanupExpiredBuckets(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { allowed: true };
}
