import { afterEach, describe, expect, it, vi } from 'vitest'
import { verifyTurnstile } from '@/lib/turnstile'

const reply = (body: unknown) =>
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body))))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('verifyTurnstile hostname', () => {
  it('accepts allowed hostnames', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 's')
    reply({ success: true, hostname: 'hungnguyen.dev' })
    expect(await verifyTurnstile('t', null)).toBe(true)
  })

  it('rejects foreign or missing hostnames', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 's')
    reply({ success: true, hostname: 'evil.example' })
    expect(await verifyTurnstile('t', null)).toBe(false)
    reply({ success: true })
    expect(await verifyTurnstile('t', null)).toBe(false)
  })

  it('accepts the NEXT_PUBLIC_SITE_URL host', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', 's')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://staging.example.com')
    reply({ success: true, hostname: 'staging.example.com' })
    expect(await verifyTurnstile('t', null)).toBe(true)
  })
})
