type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export function rateLimit(opts: { max: number; windowMs: number }) {
  return (key: string): { allowed: boolean; remaining: number; resetIn: number } => {
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return { allowed: true, remaining: opts.max - 1, resetIn: opts.windowMs };
    }

    if (existing.count >= opts.max) {
      const resetIn = existing.resetAt - now;
      return { allowed: false, remaining: 0, resetIn };
    }

    existing.count++;
    return { allowed: true, remaining: opts.max - existing.count, resetIn: existing.resetAt - now };
  };
}

export async function getClientIp(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export function getRequestIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function withRateLimit(opts: { max: number; windowMs: number; key?: string }): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const ip = await getClientIp();
  const limiter = rateLimit({ max: opts.max, windowMs: opts.windowMs });
  return limiter(opts.key ?? ip);
}
