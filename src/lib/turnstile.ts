import { z } from 'zod'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const ResponseSchema = z.object({
  success: z.boolean(),
  hostname: z.string().optional(),
})

function allowedHostnames(): Set<string> {
  const hosts = new Set(['hungnguyen.dev', 'www.hungnguyen.dev'])
  // Tokens minted on a local page must never verify in production.
  if (process.env.NODE_ENV !== 'production') hosts.add('localhost')
  const site = process.env.NEXT_PUBLIC_SITE_URL
  if (site) {
    try {
      hosts.add(new URL(site).hostname)
    } catch {
      // Ignore a malformed site URL; the static allowlist still applies.
    }
  }
  return hosts
}

export function isTurnstileEnforced(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  )
}

/** Fails closed: any network, HTTP or parse failure returns false. */
export async function verifyTurnstile(
  token: string | null,
  ip: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('Turnstile site key is set but TURNSTILE_SECRET_KEY is missing; rejecting')
    return false
  }
  if (!token) return false

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
    return (
      parsed.success &&
      parsed.data.success &&
      parsed.data.hostname !== undefined &&
      allowedHostnames().has(parsed.data.hostname)
    )
  } catch {
    return false
  }
}
