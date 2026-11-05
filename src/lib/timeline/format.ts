import type { TimelineEntry, YearMonth } from './types'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

export function parseYearMonth(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number)
  return { year, month }
}

/** `2025-02` -> `Feb 2025`. */
export function formatMonth(value: YearMonth): string {
  const { year, month } = parseYearMonth(value)
  return `${MONTHS[month - 1]} ${year}`
}

/** `2025-02` -> `2025`. */
export function formatYear(value: YearMonth): string {
  return String(parseYearMonth(value).year)
}

/** Point -> `Feb 2025`; range -> `Feb 2025 – now`; `years` collapses months. */
export function formatRange(
  entry: Pick<TimelineEntry, 'start' | 'end' | 'tag'>,
  options: { years?: boolean } = {}
): string {
  if (entry.tag === 'lab') return 'working tree'
  const fmt = options.years ? formatYear : formatMonth
  if (entry.end === undefined) return fmt(entry.start)
  return `${fmt(entry.start)} – ${entry.end === null ? 'now' : fmt(entry.end)}`
}

/** `2025-02` -> 2025.083 (fractional year, month start). */
export function toYearFraction(value: YearMonth): number {
  const { year, month } = parseYearMonth(value)
  return year + (month - 1) / 12
}

/** Position of `year` within [min, max] as a 0-100 percentage, clamped. */
export function yearToPercent(year: number, min: number, max: number): number {
  if (max <= min) return 0
  return Math.min(100, Math.max(0, ((year - min) / (max - min)) * 100))
}

/** Latest dated entry whose start is at or before `year` (fractional). */
export function latestAtYear(
  entries: readonly TimelineEntry[],
  year: number
): TimelineEntry | undefined {
  let best: TimelineEntry | undefined
  for (const entry of entries) {
    if (entry.tag === 'lab') continue
    const start = toYearFraction(entry.start)
    if (start > year) continue
    if (!best || start >= toYearFraction(best.start)) best = entry
  }
  return best
}

/** Stable 7-char pseudo commit hash for display. */
export function shortSha(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h.toString(16).padStart(7, '0').slice(-7)
}
