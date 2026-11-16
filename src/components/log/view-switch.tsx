'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TIMELINE_OPEN_EVENT, TOUR_OPEN_EVENT } from '@/constants/ids'
import type { TourOpenDetail } from '@/constants/ids'
import { FOCUS_RING } from './lanes'

type View = 'log' | 'machine'

const STORAGE_KEY = 'timeline:view'
const SEEN_KEY = 'tour:seen-groups'
const SEEN_EVENT = 'tour:seen'
const PHONE_QUERY = '(max-width: 767px)'
const STORY_BUTTON_ID = 'view-switch-story'

const VIEWS: readonly { value: View; label: string }[] = [
  { value: 'log', label: 'Commit log' },
  { value: 'machine', label: 'Time Machine' },
]

const BUTTON =
  'inline-flex items-center gap-2 rounded px-3 py-1.5 font-mono text-sm transition-colors duration-150 motion-reduce:transition-none'

function readStored(): View | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (value === 'plain') return 'machine'
    return value === 'log' || value === 'machine' ? value : null
  } catch {
    return null
  }
}

function hasSeenTour(): boolean {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY)
    const seen: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(seen) && seen.length > 0
  } catch {
    return false
  }
}

interface ViewSwitchProps {
  log: ReactNode
  machine: ReactNode
}

export function ViewSwitch({ log, machine }: ViewSwitchProps) {
  const [view, setView] = useState<View>('log')
  const [phone, setPhone] = useState(false)
  const [seen, setSeen] = useState(true)

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY)
    const onChange = () => setPhone(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const sync = () => setSeen(hasSeenTour())
    sync()
    window.addEventListener(SEEN_EVENT, sync)
    return () => window.removeEventListener(SEEN_EVENT, sync)
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

  const openTour = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent<TourOpenDetail>(TOUR_OPEN_EVENT, {
        detail: { group: 'career', originId: STORY_BUTTON_ID },
      })
    )
  }, [])

  const shown: View = phone ? 'log' : view

  return (
    <div>
      <div
        role="group"
        aria-label="Timeline view"
        className="mb-6 inline-flex rounded border border-bp-line p-0.5"
      >
        {VIEWS.map(({ value, label }) => {
          const className = `${BUTTON} ${FOCUS_RING} ${
            shown === value ? 'bg-bp-btn text-bp-btn-fg' : 'text-bp-muted hover:text-bp-ink'
          }`
          if (value === 'machine' && phone) {
            return (
              <button
                key={value}
                id={STORY_BUTTON_ID}
                type="button"
                onClick={openTour}
                className={`${BUTTON} ${FOCUS_RING} text-bp-muted hover:text-bp-ink`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-4 w-4 rounded-full ${seen ? '' : 'story-ring-pulse'}`}
                  style={{
                    background:
                      'conic-gradient(var(--branch-1), var(--bp-accent), var(--lane-edu), var(--branch-1))',
                    mask: 'radial-gradient(circle, transparent 4px, #000 5px)',
                  }}
                />
                Story
              </button>
            )
          }
          return (
            <button
              key={value}
              type="button"
              aria-pressed={shown === value}
              onClick={() => choose(value)}
              className={className}
            >
              {label}
            </button>
          )
        })}
      </div>
      <div hidden={shown !== 'log'}>{log}</div>
      {!phone && <div hidden={shown !== 'machine'}>{machine}</div>}
    </div>
  )
}
