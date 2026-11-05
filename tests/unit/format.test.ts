import { describe, expect, it } from 'vitest'
import {
  formatRange,
  latestAtYear,
  toYearFraction,
  yearToPercent,
} from '@/lib/timeline/format'
import type { TimelineEntry } from '@/lib/timeline/types'

const e = (id: string, start: string, tag?: 'lab'): TimelineEntry => ({
  id,
  lane: 'work',
  title: id,
  org: id,
  start,
  diff: { add: [] },
  plain: id,
  stack: [],
  links: [],
  ...(tag ? { tag } : {}),
})

describe('formatRange', () => {
  it('formats point, closed, ongoing and lab', () => {
    expect(formatRange({ start: '2025-02' })).toBe('Feb 2025')
    expect(formatRange({ start: '2024-05', end: '2024-08' })).toBe('May 2024 – Aug 2024')
    expect(formatRange({ start: '2025-02', end: null })).toBe('Feb 2025 – now')
    expect(formatRange({ start: '2024-05', end: '2024-08' }, { years: true })).toBe('2024 – 2024')
    expect(formatRange({ start: '2026-10', tag: 'lab' })).toBe('working tree')
  })
})

describe('latestAtYear', () => {
  const list = [e('a', '2019-01'), e('b', '2021-06'), e('lab', '2021-09', 'lab')]
  it('returns latest start <= year and skips lab', () => {
    expect(latestAtYear(list, 2021.9)?.id).toBe('b')
    expect(latestAtYear(list, 2020)?.id).toBe('a')
    expect(latestAtYear(list, 2030)?.id).toBe('b')
  })
  it('returns undefined before first entry', () => {
    expect(latestAtYear(list, 2018)).toBeUndefined()
  })
  it('includes entries starting exactly at the year', () => {
    expect(latestAtYear(list, toYearFraction('2021-06'))?.id).toBe('b')
  })
})

describe('yearToPercent', () => {
  it('maps and clamps', () => {
    expect(yearToPercent(2021, 2016, 2026)).toBe(50)
    expect(yearToPercent(2000, 2016, 2026)).toBe(0)
    expect(yearToPercent(2100, 2016, 2026)).toBe(100)
    expect(yearToPercent(2020, 2026, 2026)).toBe(0)
  })
})
