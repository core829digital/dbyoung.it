/**
 * Rate-limit in-memory per IP+route.
 * Limite noto: su hosting multi-istanza (Vercel) il contatore è per istanza —
 * difesa di base, non sostitutiva di un limiter distribuito (Upstash) in futuro.
 */

interface Bucket {
  n: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { n: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  b.n += 1;
  if (b.n > max) return { allowed: false, retryAfterMs: b.resetAt - now };
  return { allowed: true, retryAfterMs: 0 };
}

/** Chiave per IP client + nome route. */
export function limitKey(ip: string, route: string): string {
  return `${route}|${ip}`;
}

// Pulizia periodica per non far crescere la mappa all'infinito
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = 0;
export function maybeCleanupRateLimits(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [k, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(k);
  }
}
