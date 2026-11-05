import { z } from 'zod'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const ResponseSchema = z.object({ success: z.boolean() })

export function isTurnstileEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

/** Fails closed: any network, HTTP or parse failure returns false. */
export async function verifyTurnstile(
  token: string | null,
  ip: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token) return false

  const body = new URLSearchParams({ secret, response: token })
  if (ip) body.set('remoteip', ip)

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return false
    const parsed = ResponseSchema.safeParse(await res.json())
    return parsed.success && parsed.data.success
  } catch {
    return false
  }
}
