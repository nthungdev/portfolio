'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TIMELINE_OPEN_EVENT } from '@/constants/ids'
import { FOCUS_RING } from './lanes'

type View = 'log' | 'machine'

const STORAGE_KEY = 'timeline:view'
const PHONE_QUERY = '(max-width: 767px)'

const VIEWS: readonly { value: View; label: string }[] = [
  { value: 'log', label: 'Commit log' },
  { value: 'machine', label: 'Time Machine' },
]

function readStored(): View | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'plain') return 'machine'
    return value === 'log' || value === 'machine' ? value : null
  } catch {
    return null
  }
}

interface ViewSwitchProps {
  log: ReactNode
  machine: ReactNode
}

export function ViewSwitch({ log, machine }: ViewSwitchProps) {
  const [view, setView] = useState<View>('log')
  const [phone, setPhone] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY)
    const onChange = () => setPhone(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onHash = () => {
      const { hash } = window.location
      if (hash === '#plain' || hash === '#machine') {
        setView('machine')
        document.getElementById('log')?.scrollIntoView({ block: 'start' })
      } else if (hash.startsWith('#c-')) {
        setView('log')
      }
    }
    const { hash } = window.location
    if (hash === '#plain' || hash === '#machine' || hash.startsWith('#c-')) onHash()
    else {
      const stored = readStored()
      if (stored) setView(stored)
    }
    const onOpen = () => setView('log')
    window.addEventListener('hashchange', onHash)
    window.addEventListener(TIMELINE_OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener('hashchange', onHash)
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

  // The Time Machine needs a wide screen; phones get the log only.
  const shown: View = phone ? 'log' : view

  return (
    <div>
      {!phone && (
        <div
          role="group"
          aria-label="Timeline view"
          className="mb-6 inline-flex rounded border border-bp-line p-0.5"
        >
          {VIEWS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={shown === value}
              onClick={() => choose(value)}
              className={`rounded px-3 py-1.5 font-mono text-sm transition-colors duration-150 motion-reduce:transition-none ${FOCUS_RING} ${
                shown === value ? 'bg-bp-btn text-bp-btn-fg' : 'text-bp-muted hover:text-bp-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div hidden={shown !== 'log'}>{log}</div>
      {!phone && <div hidden={shown !== 'machine'}>{machine}</div>}
    </div>
  )
}
