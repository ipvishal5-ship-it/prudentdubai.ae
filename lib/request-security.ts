import 'server-only';

const buckets = new Map<string, { count: number; resetsAt: number }>();

export function requestIp(request: Request): string {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf && /^[\da-fA-F.:]+$/.test(cf.trim())) return cf.trim();

  const real = request.headers.get('x-real-ip');
  if (real && /^[\da-fA-F.:]+$/.test(real.trim())) return real.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded.split(',')[0]?.trim();
    if (candidate && /^[\da-fA-F.:]+$/.test(candidate)) return candidate;
  }

  return 'unknown';
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetsAt <= now) buckets.delete(bucketKey);
    }
  }
  const current = buckets.get(key);
  if (!current || current.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
