export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

export interface RateLimiter {
  consume(key: string): Promise<RateLimitResult>
}

/** Per-instance sliding window; resets on cold start. Swap for a shared store later. */
export function createInMemoryRateLimiter(
  limit: number,
  windowMs: number
): RateLimiter {
  const hits = new Map<string, number[]>()

  return {
    async consume(key) {
      const now = Date.now()
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)

      if (recent.length >= limit) {
        hits.set(key, recent)
        return {
          allowed: false,
          retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000),
        }
      }

      recent.push(now)
      hits.set(key, recent)

      if (hits.size > 1000) {
        for (const [k, times] of hits) {
          if (times.every((t) => now - t >= windowMs)) hits.delete(k)
        }
      }
      return { allowed: true, retryAfterSeconds: 0 }
    },
  }
}
