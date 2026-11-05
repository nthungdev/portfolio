import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HONEYPOT_FIELD, type ContactFormState } from '@/utils/validation'

const send = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }),
}))

const fd = (o: Record<string, string>) => {
  const f = new FormData()
  for (const [k, v] of Object.entries(o)) f.set(k, v)
  return f
}
const good = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello there',
  label: 'job opportunity',
  message: 'This is a long enough message.',
}
const prev: ContactFormState = {
  fields: { name: '', email: '', subject: '', label: 'job opportunity', message: '' },
}

async function load() {
  vi.resetModules()
  vi.stubEnv('CONTACT_RECEIVER_EMAIL', 'me@example.com')
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('TURNSTILE_SECRET_KEY', '')
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
  return (await import('@/actions/email')).sendContactForm
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ error: null })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('sendContactForm', () => {
  it('honeypot returns success without sending', async () => {
    const act = await load()
    const r = await act(prev, fd({ ...good, [HONEYPOT_FIELD]: 'filled by a bot' }))
    expect(r.success).toBe(true)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns field errors and does not send on invalid input', async () => {
    const act = await load()
    const r = await act(prev, fd({ ...good, name: '', subject: 'a\nb' }))
    expect(r.success).toBeUndefined()
    expect(r.inputErrors?.name).toBeDefined()
    expect(r.inputErrors?.subject).toBeDefined()
    expect(send).not.toHaveBeenCalled()
  })

  it('sends with "[label] title" subject and replyTo', async () => {
    const act = await load()
    const r = await act(prev, fd(good))
    expect(r.success).toBe(true)
    expect(send).toHaveBeenCalledOnce()
    const arg = send.mock.calls[0][0]
    expect(arg.subject).toBe('[job opportunity] Hello there')
    expect(arg.replyTo).toBe('ada@example.com')
    expect(arg.to).toEqual(['me@example.com'])
  })

  it('does not report success when delivery fails', async () => {
    send.mockResolvedValue({ error: { name: 'x' } })
    const act = await load()
    const r = await act(prev, fd(good))
    expect(r.success).toBeUndefined()
    expect(r.submitError).toBeTruthy()
  })

  it('rejects the 6th valid request within an hour', async () => {
    const act = await load()
    for (let i = 0; i < 5; i++) expect((await act(prev, fd(good))).success).toBe(true)
    const r = await act(prev, fd(good))
    expect(r.success).toBeUndefined()
    expect(r.submitError).toMatch(/Too many/)
    expect(send).toHaveBeenCalledTimes(5)
  })

  it('returns a submitError instead of throwing when RESEND_API_KEY is missing', async () => {
    const act = await load()
    vi.stubEnv('RESEND_API_KEY', '')
    const r = await act(prev, fd(good))
    expect(r.success).toBeUndefined()
    expect(r.submitError).toMatch(/contact@hungnguyen\.dev/)
    expect(send).not.toHaveBeenCalled()
  })

  it('keys the rate limit on the right-most x-forwarded-for entry', async () => {
    const act = await load()
    // Same right-most IP (203.0.113.9 from the mock) is limited regardless of spoofed left entries.
    for (let i = 0; i < 5; i++) expect((await act(prev, fd(good))).success).toBe(true)
    expect((await act(prev, fd(good))).submitError).toMatch(/Too many/)
  })

  it('fails closed when only the Turnstile site key is set', async () => {
    const act = await load()
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site')
    const r = await act(prev, fd({ ...good, 'cf-turnstile-response': 'tok' }))
    expect(r.success).toBeUndefined()
    expect(r.submitError).toMatch(/verify/)
    expect(send).not.toHaveBeenCalled()
  })

  it('does not consume a rate-limit slot when Turnstile fails', async () => {
    const act = await load()
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'site')
    for (let i = 0; i < 6; i++) await act(prev, fd(good))
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '')
    expect((await act(prev, fd(good))).success).toBe(true)
  })
})
