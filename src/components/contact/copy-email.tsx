'use client'

import { useEffect, useRef, useState } from 'react'
import { copyText } from './copy-text'

export default function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function onCopy() {
    setStatus((await copyText(email)) ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
      <span className="text-bp-muted">or email</span>
      <span className="select-all break-all text-bp-ink">{email}</span>
      <div className="flex flex-wrap gap-3">
        <a
          href={`mailto:${email}?subject=Hello%20from%20hungnguyen.dev`}
          className="inline-flex min-h-11 items-center rounded bg-bp-btn px-4 py-2 text-xs font-semibold uppercase tracking-wide text-bp-btn-fg transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bp-bg"
        >
          Open email
        </a>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex min-h-11 items-center rounded border border-bp-line px-4 py-2 text-xs uppercase tracking-wide text-bp-ink transition-colors duration-150 hover:border-bp-accent hover:text-bp-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent"
        >
          {status === 'copied' ? 'Copied' : 'Copy'}
        </button>
      </div>
      <span role="status" className="sr-only">
        {status === 'copied'
          ? 'Email copied to clipboard'
          : status === 'failed'
            ? 'Copy failed, select the email manually'
            : ''}
      </span>
    </div>
  )
}
