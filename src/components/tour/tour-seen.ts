import { useMemo, useSyncExternalStore } from 'react'
import { TOUR_OPEN_EVENT, type TourOpenDetail } from '@/constants/ids'

export const SEEN_KEY = 'tour:seen-groups'
export const HINT_KEY = 'tour:hint-seen'
export const TOUR_SEEN_EVENT = 'tour:seen'

const EMPTY = '[]'

function readRaw(): string {
  try {
    return localStorage.getItem(SEEN_KEY) ?? EMPTY
  } catch {
    return EMPTY
  }
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function markGroupSeen(id: string): void {
  const seen = parse(readRaw())
  if (seen.includes(id)) return
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id]))
  } catch {
    // storage unavailable: rings stay unseen
  }
  window.dispatchEvent(new Event(TOUR_SEEN_EVENT))
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(TOUR_SEEN_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(TOUR_SEEN_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Ids of the groups whose last slide has played, live across tabs and components. */
export function useSeenGroups(): ReadonlySet<string> {
  const raw = useSyncExternalStore(subscribe, readRaw, () => EMPTY)
  return useMemo(() => new Set(parse(raw)), [raw])
}

export function readHintSeen(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return true
  }
}

export function writeHintSeen(): void {
  try {
    localStorage.setItem(HINT_KEY, '1')
  } catch {
    // storage unavailable: the hint shows again next time
  }
}

function subscribeReduce(onChange: () => void): () => void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
}

export function openTour(group: string, originId?: string): void {
  window.dispatchEvent(new CustomEvent<TourOpenDetail>(TOUR_OPEN_EVENT, { detail: { group, originId } }))
}
