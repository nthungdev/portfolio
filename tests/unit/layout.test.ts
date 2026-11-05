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

const lay = (entries: TimelineEntry[]) => layoutGraph(entries, { includeDrafts: true })
const rowOf = (entries: TimelineEntry[], id: string) =>
  lay(entries).rows.find((r) => r.entry.id === id)!

afterEach(() => vi.unstubAllEnvs())

describe('layoutGraph', () => {
  it('master is continuous: every row but the oldest continues below', () => {
    const { rows } = lay(timeline as TimelineEntry[])
    expect(rows.slice(0, -1).every((r) => r.masterBelow)).toBe(true)
    expect(rows.at(-1)!.masterBelow).toBe(false)
  })

  it('every span is a branch with a column of at least 1', () => {
    const { rows } = lay(timeline as TimelineEntry[])
    for (const r of rows) {
      if (r.entry.end === undefined) expect(r.column).toBe(0)
      else expect(r.column).toBeGreaterThanOrEqual(1)
    }
  })

  it('an ended span merges at the nearest row above that starts after its end', () => {
    const entries = [
      mk('top', '2022-01', undefined, 'project'),
      mk('mid', '2021-03', undefined, 'project'),
      mk('a', '2021-01', '2021-02'),
      mk('old', '2020-01', undefined, 'project'),
    ]
    const { rows } = lay(entries)
    expect(rows.map((r) => r.entry.id)).toEqual(['top', 'mid', 'a', 'old'])
    expect(rows[1].merges.map((m) => m.id)).toEqual(['a'])
    expect(rows[2].continuesUp).toBe(true)
    expect(rows[0].merges).toHaveLength(0)
  })

  it('ongoing span runs to the top with no merge', () => {
    const entries = [
      mk('top', '2024-01', undefined, 'project'),
      mk('now', '2019-06', null),
      mk('pt', '2022-01', undefined, 'project'),
    ]
    const { rows } = lay(entries)
    expect(rows.map((r) => r.entry.id)).toEqual(['top', 'pt', 'now'])
    expect(rows[0].passing.map((p) => p.id)).toEqual(['now'])
    expect(rows[1].passing.map((p) => p.id)).toEqual(['now'])
    expect(rows.flatMap((r) => r.merges)).toHaveLength(0)
    expect(rows[2].continuesUp).toBe(true)
  })

  it('concurrently active branches never share a column', () => {
    const entries = [
      mk('a', '2020-01', '2022-12'),
      mk('b', '2021-01', '2022-06'),
      mk('c', '2021-03', '2022-01', 'education'),
      mk('x', '2023-06', undefined, 'project'),
    ]
    const cols = ['a', 'b', 'c'].map((id) => rowOf(entries, id).column)
    expect(new Set(cols).size).toBe(3)
    expect(cols.every((c) => c >= 1)).toBe(true)
  })

  it('real timeline: no two overlapping branches share a column; compact', () => {
    const { rows, columns } = lay(timeline as TimelineEntry[])
    const idx = new Map(rows.map((r, i) => [r.entry.id, i]))
    const span = (id: string) => {
      const i = idx.get(id)!
      const merged = rows.findIndex((r) => r.merges.some((m) => m.id === id))
      return { from: merged === -1 ? 0 : merged, to: i }
    }
    const branches = rows.filter((r) => r.kind === 'branch')
    for (const a of branches)
      for (const b of branches) {
        if (a === b || a.column !== b.column) continue
        const sa = span(a.entry.id)
        const sb = span(b.entry.id)
        expect(sa.to < sb.from || sb.to < sa.from).toBe(true)
      }
    expect(columns).toBeLessThanOrEqual(7)
  })

  it('reuses a column after the branch merges', () => {
    const entries = [
      mk('p2', '2022-01', undefined, 'project'),
      mk('b', '2021-01', '2021-06'),
      mk('p1', '2020-09', undefined, 'project'),
      mk('a', '2020-01', '2020-06'),
    ]
    expect(rowOf(entries, 'a').column).toBe(1)
    expect(rowOf(entries, 'b').column).toBe(1)
  })

  it('puts long-lived branches on outer columns and short ones beside master', () => {
    const entries = [
      mk('top', '2023-01', undefined, 'project'),
      mk('short', '2021-01', '2021-06'),
      mk('long', '2019-01', '2022-12'),
    ]
    expect(rowOf(entries, 'short').column).toBe(1)
    expect(rowOf(entries, 'long').column).toBe(2)
  })

  it('points sit on column 0', () => {
    const entries = [mk('p', '2021-01', undefined, 'project'), mk('a', '2020-01', null)]
    expect(rowOf(entries, 'p').column).toBe(0)
    expect(rowOf(entries, 'p').kind).toBe('point')
  })

  it('lab entries are excluded from rows and returned as working', () => {
    const { rows, working } = lay(timeline as TimelineEntry[])
    expect(rows.some((r) => r.entry.tag === 'lab')).toBe(false)
    expect(working.length).toBeGreaterThan(0)
    expect(working.every((e) => e.tag === 'lab')).toBe(true)
  })

  it('has no community lane left', () => {
    expect(timeline.some((e) => (e.lane as string) === 'community')).toBe(false)
  })

  it('filtering lanes keeps order and columns of remaining rows', () => {
    const full = lay(timeline as TimelineEntry[])
    const filtered = layoutGraph(timeline, {
      includeDrafts: true,
      lanes: ['work', 'education'],
    })
    const expected = full.rows.filter((r) => ['work', 'education'].includes(r.entry.lane))
    expect(filtered.rows.map((r) => r.entry.id)).toEqual(expected.map((r) => r.entry.id))
    expect(filtered.rows.map((r) => r.column)).toEqual(expected.map((r) => r.column))
  })

  it('orders rows newest first', () => {
    const { rows } = lay(timeline as TimelineEntry[])
    const starts = rows.map((r) => r.entry.start)
    expect(starts).toEqual([...starts].sort((a, b) => b.localeCompare(a)))
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
})
