import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInMemoryRateLimiter } from '@/lib/rate-limit'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('createInMemoryRateLimiter', () => {
  it('allows up to the limit then rejects with retry-after', async () => {
    const l = createInMemoryRateLimiter(5, 3_600_000)
    for (let i = 0; i < 5; i++) expect((await l.consume('ip')).allowed).toBe(true)
    const r = await l.consume('ip')
    expect(r.allowed).toBe(false)
    expect(r.retryAfterSeconds).toBe(3600)
  })

  it('tracks keys independently', async () => {
    const l = createInMemoryRateLimiter(1, 1000)
    expect((await l.consume('a')).allowed).toBe(true)
    expect((await l.consume('b')).allowed).toBe(true)
    expect((await l.consume('a')).allowed).toBe(false)
  })

  it('slides: old hits expire individually', async () => {
    const l = createInMemoryRateLimiter(2, 1000)
    await l.consume('k')
    vi.advanceTimersByTime(600)
    await l.consume('k')
    expect((await l.consume('k')).allowed).toBe(false)
    vi.advanceTimersByTime(401)
    expect((await l.consume('k')).allowed).toBe(true)
    expect((await l.consume('k')).allowed).toBe(false)
  })

  it('rejected attempts do not extend the window', async () => {
    const l = createInMemoryRateLimiter(1, 1000)
    await l.consume('k')
    vi.advanceTimersByTime(500)
    await l.consume('k')
    vi.advanceTimersByTime(501)
    expect((await l.consume('k')).allowed).toBe(true)
  })

  it('stays bounded at 1000 keys by evicting the oldest when none have expired', async () => {
    const l = createInMemoryRateLimiter(1, 60 * 60 * 1000)
    for (let i = 0; i <= 1000; i++) await l.consume(`ip-${i}`)
    // ip-0 was evicted, so it gets a fresh window; a recent key is still limited.
    expect((await l.consume('ip-0')).allowed).toBe(true)
    expect((await l.consume('ip-1000')).allowed).toBe(false)
  })
})
