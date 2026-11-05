'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { TOUR_OPEN_EVENT, type TourOpenDetail } from '@/constants/ids'
import type { TourGroup } from '@/lib/tour/build-tour'
import { TourSession } from './tour-session'

interface Session {
  startIndex: number
  originId?: string
}

const HASH = /^#tour(?:-(.+))?$/

/** Stories tour, mounted once per page; opens on `tour:open` or the `#tour` hash. */
export function TourDialog({ groups }: { groups: TourGroup[] }) {
  const [session, setSession] = useState<Session | null>(null)

  const open = useCallback(
    (groupId?: string, originId?: string) => {
      const found = groups.findIndex((g) => g.id === (groupId ?? 'hi'))
      setSession((current) => current ?? { startIndex: Math.max(0, found), originId })
    },
    [groups],
  )

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<Partial<TourOpenDetail> | undefined>).detail
      open(
        typeof detail?.group === 'string' ? detail.group : undefined,
        typeof detail?.originId === 'string' ? detail.originId : undefined,
      )
    }
    const onHash = () => {
      const match = HASH.exec(window.location.hash)
      if (match) open(match[1])
    }
    window.addEventListener(TOUR_OPEN_EVENT, onOpen)
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => {
      window.removeEventListener(TOUR_OPEN_EVENT, onOpen)
      window.removeEventListener('hashchange', onHash)
    }
  }, [open])

  const onClosed = useCallback(() => {
    setSession(null)
    if (HASH.test(window.location.hash)) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  if (!session || groups.length === 0) return null
  return createPortal(
    <TourSession
      groups={groups}
      startIndex={session.startIndex}
      originId={session.originId}
      onClosed={onClosed}
    />,
    document.body,
  )
}
