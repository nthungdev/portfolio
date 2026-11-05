'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TIMELINE_OPEN_EVENT } from '@/constants/ids'
import { FOCUS_RING } from './lanes'

type View = 'log' | 'plain'

const STORAGE_KEY = 'timeline:view'

const VIEWS: readonly { value: View; label: string }[] = [
  { value: 'log', label: 'Commit log' },
  { value: 'plain', label: 'Plain view' },
]

function readStored(): View | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'log' || value === 'plain' ? value : null
  } catch {
    return null
  }
}

interface ViewSwitchProps {
  log: ReactNode
  plain: ReactNode
}

export function ViewSwitch({ log, plain }: ViewSwitchProps) {
  const [view, setView] = useState<View>('log')

  useEffect(() => {
    const onLoad = () => {
      const { hash } = window.location
      if (hash === '#plain') {
        setView('plain')
        document.getElementById('log')?.scrollIntoView({ block: 'start' })
      } else if (hash.startsWith('#c-')) {
        setView('log')
      }
    }
    const { hash } = window.location
    if (hash === '#plain' || hash.startsWith('#c-')) onLoad()
    else {
      const stored = readStored()
      if (stored) setView(stored)
    }
    const onOpen = () => setView('log')
    window.addEventListener('hashchange', onLoad)
    window.addEventListener(TIMELINE_OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener('hashchange', onLoad)
      window.removeEventListener(TIMELINE_OPEN_EVENT, onOpen)
    }
  }, [])

  const choose = useCallback((next: View) => {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage unavailable; the choice just won't persist.
    }
  }, [])

  return (
    <div>
      <div
        role="group"
        aria-label="Timeline view"
        className="mb-6 inline-flex rounded border border-bp-line p-0.5"
      >
        {VIEWS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => choose(value)}
            className={`rounded px-3 py-1.5 font-mono text-sm transition-colors duration-150 motion-reduce:transition-none ${FOCUS_RING} ${
              view === value
                ? 'bg-bp-btn text-bp-btn-fg'
                : 'text-bp-muted hover:text-bp-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div hidden={view !== 'log'}>{log}</div>
      <div hidden={view !== 'plain'}>{plain}</div>
    </div>
  )
}
