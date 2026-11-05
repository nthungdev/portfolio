import { afterEach, describe, expect, it, vi } from 'vitest'
import timeline from '@/content/timeline'
import { BRANCH_COLORS, layoutGraph } from '@/lib/timeline/layout'
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
const startOf = (entries: TimelineEntry[], id: string) =>
  lay(entries).rows.find((r) => r.key === id)!
const keys = (entries: TimelineEntry[]) => lay(entries).rows.map((r) => r.key)

afterEach(() => vi.unstubAllEnvs())

describe('layoutGraph', () => {
  it('a span becomes a start row plus a merge row; a point is one master commit', () => {
    const entries = [
      mk('top', '2022-01', undefined, 'project'),
      mk('a', '2021-01', '2021-06'),
      mk('old', '2020-01', undefined, 'project'),
    ]
    const { rows } = lay(entries)
    expect(rows.map((r) => [r.key, r.kind])).toEqual([
      ['top', 'point'],
      ['a:merge', 'merge'],
      ['a', 'start'],
      ['old', 'point'],
    ])
    expect(rows[1].branch).toEqual(rows[2].branch)
    expect(rows[0].branch).toBeNull()
  })

  it('a branch passes through every row between its merge and its start', () => {
    const entries = [
      mk('long', '2019-01', '2022-12'),
      mk('mid', '2020-06', undefined, 'project'),
    ]
    const { rows } = lay(entries)
    expect(rows.map((r) => r.key)).toEqual(['long:merge', 'mid', 'long'])
    expect(rows[1].passing.map((p) => p.id)).toEqual(['long'])
    expect(rows[0].passing).toHaveLength(0)
    expect(rows[2].passing).toHaveLength(0)
  })

  it('an ongoing branch has no merge row and is open at the top', () => {
    const entries = [
      mk('top', '2024-01', undefined, 'project'),
      mk('now', '2019-06', null),
      mk('pt', '2022-01', undefined, 'project'),
    ]
    const { rows, open } = lay(entries)
    expect(rows.map((r) => r.key)).toEqual(['top', 'pt', 'now'])
    expect(rows[0].passing.map((p) => p.id)).toEqual(['now'])
    expect(rows[1].passing.map((p) => p.id)).toEqual(['now'])
    expect(open.map((b) => b.id)).toEqual(['now'])
  })

  it('a one-month span merges above its own start', () => {
    expect(keys([mk('m', '2021-03', '2021-03')])).toEqual(['m:merge', 'm'])
  })

  it('master runs through every row; only the oldest row ends it', () => {
    const { rows } = lay(timeline as TimelineEntry[])
    expect(rows.slice(0, -1).every((r) => r.masterBelow)).toBe(true)
    expect(rows.at(-1)!.masterBelow).toBe(false)
    expect(rows.every((r) => r.masterAbove)).toBe(true)
  })

  it('without working entries the top row has no master above it', () => {
    const { rows } = lay([mk('a', '2020-01', undefined, 'project')])
    expect(rows[0].masterAbove).toBe(false)
  })

  it('concurrent branches never share a column', () => {
    const entries = [
      mk('a', '2020-01', '2022-12'),
      mk('b', '2021-01', '2022-06'),
      mk('c', '2021-03', '2022-01', 'education'),
    ]
    const cols = ['a', 'b', 'c'].map((id) => startOf(entries, id).branch!.column)
    expect(new Set(cols).size).toBe(3)
    expect(cols.every((c) => c >= 1)).toBe(true)
  })

  it('reuses a column once a branch has forked', () => {
    const entries = [
      mk('p2', '2022-01', undefined, 'project'),
      mk('b', '2021-01', '2021-06'),
      mk('p1', '2020-09', undefined, 'project'),
      mk('a', '2020-01', '2020-06'),
    ]
    expect(startOf(entries, 'a').branch!.column).toBe(1)
    expect(startOf(entries, 'b').branch!.column).toBe(1)
  })

  it('overlapping branches get different colours from the palette', () => {
    const entries = [
      mk('a', '2020-01', '2022-12'),
      mk('b', '2021-01', '2022-06'),
      mk('c', '2021-03', '2022-01'),
    ]
    const colors = ['a', 'b', 'c'].map((id) => startOf(entries, id).branch!.color)
    expect(new Set(colors).size).toBe(3)
    expect(colors.every((c) => c >= 0 && c < BRANCH_COLORS)).toBe(true)
  })

  it('uses the optional branch name for the pill', () => {
    const entries = [mk('a', '2020-01', '2020-06', 'work', { branch: 'feature/a' })]
    expect(lay(entries).rows.every((r) => r.branch?.name === 'feature/a')).toBe(true)
  })

  it('real timeline: overlapping branches never share a column, and it stays narrow', () => {
    const { rows, columns } = lay(timeline as TimelineEntry[])
    const spanOf = (id: string) => ({
      from: Math.max(0, rows.findIndex((r) => r.key === `${id}:merge`)),
      to: rows.findIndex((r) => r.key === id),
    })
    const starts = rows.filter((r) => r.kind === 'start')
    for (const a of starts)
      for (const b of starts) {
        if (a === b || a.branch!.column !== b.branch!.column) continue
        const sa = spanOf(a.entry.id)
        const sb = spanOf(b.entry.id)
        expect(sa.to < sb.from || sb.to < sa.from).toBe(true)
      }
    expect(columns).toBeLessThanOrEqual(8)
  })

  it('real timeline: every ended span has exactly one merge row above its start', () => {
    const { rows } = lay(timeline as TimelineEntry[])
    for (const e of timeline.filter((x) => typeof x.end === 'string' && x.tag !== 'lab')) {
      const m = rows.findIndex((r) => r.key === `${e.id}:merge`)
      const s = rows.findIndex((r) => r.key === e.id)
      expect(m, e.id).toBeGreaterThanOrEqual(0)
      expect(m, e.id).toBeLessThan(s)
    }
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
    const filtered = layoutGraph(timeline, { includeDrafts: true, lanes: ['work', 'education'] })
    const expected = full.rows.filter((r) => ['work', 'education'].includes(r.entry.lane))
    expect(filtered.rows.map((r) => r.key)).toEqual(expected.map((r) => r.key))
    expect(filtered.rows.map((r) => r.branch?.column)).toEqual(expected.map((r) => r.branch?.column))
  })

  it('orders rows newest first by the month each event happened', () => {
    const { rows } = lay(timeline as TimelineEntry[])
    const at = rows.map((r) => (r.kind === 'merge' ? r.entry.end! : r.entry.start))
    expect(at).toEqual([...at].sort((a, b) => b.localeCompare(a)))
  })

  it('drops drafts in production and keeps them otherwise', () => {
    const entries = [mk('a', '2020-01', '2021-01'), mk('d', '2021-01', undefined, 'work', { draft: true })]
    vi.stubEnv('NODE_ENV', 'production')
    expect(layoutGraph(entries).rows.map((r) => r.key)).toEqual(['a:merge', 'a'])
    vi.stubEnv('NODE_ENV', 'development')
    expect(layoutGraph(entries).rows).toHaveLength(3)
  })
})
