import { afterEach, describe, expect, it, vi } from 'vitest'
import timeline from '@/content/timeline'
import { layoutGraph } from '@/lib/timeline/layout'
import type { Lane, TimelineEntry } from '@/lib/timeline/types'

const mk = (
  id: string,
  start: string,
  end: string | null | undefined,
  lane: Lane = 'work',
  extra: Partial<TimelineEntry> = {}
): TimelineEntry => ({
  id,
  lane,
  title: id,
  org: id,
  start,
  ...(end !== undefined ? { end } : {}),
  diff: { add: [] },
  plain: id,
  stack: [],
  links: [],
  ...extra,
})

const colOf = (entries: TimelineEntry[], id: string) =>
  layoutGraph(entries, { includeDrafts: true }).rows.find((r) => r.entry.id === id)!

afterEach(() => vi.unstubAllEnvs())

describe('layoutGraph', () => {
  it('returns one row per entry', () => {
    const { rows } = layoutGraph(timeline, { includeDrafts: true })
    expect(rows).toHaveLength(timeline.length)
  })

  it('forks overlapping work roles into columns 1 and 2', () => {
    const entries = [
      mk('a', '2020-01', '2022-12'),
      mk('b', '2021-01', '2022-06'),
      mk('c', '2021-03', '2022-01'),
    ]
    expect(colOf(entries, 'a').column).toBe(0)
    expect(colOf(entries, 'b').column).toBe(1)
    expect(colOf(entries, 'c').column).toBe(2)
    expect(colOf(entries, 'b').fork).toBe(true)
  })

  it('never uses more than 3 work columns', () => {
    const entries = ['a', 'b', 'c', 'd', 'e'].map((id, i) =>
      mk(id, `2020-0${i + 1}`, '2023-01')
    )
    const { rows } = layoutGraph(entries, { includeDrafts: true })
    expect(Math.max(...rows.map((r) => r.column))).toBeLessThanOrEqual(2)
  })

  it('keeps column 0 when a role ends the month the next starts', () => {
    const entries = [mk('a', '2020-01', '2021-06'), mk('b', '2021-06', '2022-06')]
    expect(colOf(entries, 'a').column).toBe(0)
    expect(colOf(entries, 'b').column).toBe(0)
  })

  it('end: null continues up to the top', () => {
    const entries = [mk('now', '2019-06', null), mk('top', '2024-01', '2024-03')]
    const { rows } = layoutGraph(entries, { includeDrafts: true })
    const now = rows.find((r) => r.entry.id === 'now')!
    expect(now.continuesUp).toBe(true)
    expect(rows[0].ending.map((s) => s.id)).toContain('now')
  })

  it('ongoing role not at the top is passing through newer rows', () => {
    const entries = [mk('now', '2019-06', null), mk('pt', '2022-01', undefined, 'project')]
    const { rows } = layoutGraph(entries, { includeDrafts: true })
    expect(rows.map((r) => r.entry.id)).toEqual(['pt', 'now'])
    expect(rows[0].ending.map((s) => s.id)).toContain('now')
    expect(rows[1].continuesUp).toBe(true)
  })

  it('filtering lanes keeps order and columns of remaining rows', () => {
    const full = layoutGraph(timeline, { includeDrafts: true })
    const filtered = layoutGraph(timeline, {
      includeDrafts: true,
      lanes: ['work', 'education'],
    })
    const expected = full.rows.filter((r) => ['work', 'education'].includes(r.entry.lane))
    expect(filtered.rows.map((r) => r.entry.id)).toEqual(expected.map((r) => r.entry.id))
    expect(filtered.rows.map((r) => r.column)).toEqual(expected.map((r) => r.column))
  })

  it('drops drafts in production and keeps them otherwise', () => {
    const entries = [mk('a', '2020-01', '2021-01'), mk('d', '2021-01', undefined, 'work', { draft: true })]
    vi.stubEnv('NODE_ENV', 'production')
    expect(layoutGraph(entries).rows.map((r) => r.entry.id)).toEqual(['a'])
    vi.stubEnv('NODE_ENV', 'development')
    expect(layoutGraph(entries).rows).toHaveLength(2)
    vi.stubEnv('NODE_ENV', 'test')
    expect(layoutGraph(entries).rows).toHaveLength(2)
  })

  it('orders rows newest first with lab rows on top', () => {
    const { rows } = layoutGraph(timeline, { includeDrafts: true })
    const nonLab = rows.filter((r) => r.entry.tag !== 'lab')
    const starts = nonLab.map((r) => r.entry.start)
    expect(starts).toEqual([...starts].sort((a, b) => b.localeCompare(a)))
    const firstNonLab = rows.findIndex((r) => r.entry.tag !== 'lab')
    expect(rows.slice(0, firstNonLab).every((r) => r.entry.tag === 'lab')).toBe(true)
    expect(rows.slice(firstNonLab).every((r) => r.entry.tag !== 'lab')).toBe(true)
  })

  it('real timeline: work columns stay within 0..2', () => {
    const { rows } = layoutGraph(timeline, { includeDrafts: true })
    for (const r of rows.filter((r) => r.entry.lane === 'work')) {
      expect(r.column).toBeLessThanOrEqual(2)
    }
  })
})
