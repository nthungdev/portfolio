'use client'

import type { ReactNode } from 'react'
import IDS from '@/constants/ids'

interface IssueLinkProps {
  className: string
  children: ReactNode
}

export function IssueLink({ className, children }: IssueLinkProps) {
  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(IDS.contact)
    if (!target) return
    event.preventDefault()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    window.setTimeout(
      () =>
        document
          .getElementById(IDS.contactNameInput)
          ?.focus({ preventScroll: true }),
      reduce ? 0 : 450
    )
  }

  return (
    <a href={`#${IDS.contact}`} onClick={onClick} className={className}>
      {children}
    </a>
  )
}
