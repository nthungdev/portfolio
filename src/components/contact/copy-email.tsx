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
      <button
        type="button"
        onClick={onCopy}
        className="rounded border border-bp-line px-2.5 py-1 text-xs uppercase tracking-wide text-bp-ink transition-colors duration-150 hover:border-bp-accent hover:text-bp-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent"
      >
        {status === 'copied' ? 'Copied' : 'Copy'}
      </button>
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
