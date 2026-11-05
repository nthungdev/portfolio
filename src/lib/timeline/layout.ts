import type {
  BranchRef,
  GraphLayout,
  GraphRow,
  LayoutOptions,
  TimelineEntry,
} from './types'

function sortNewestFirst(entries: TimelineEntry[]): TimelineEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const byStart = b.entry.start.localeCompare(a.entry.start)
      if (byStart !== 0) return byStart
      const aOngoing = a.entry.end === null ? 1 : 0
      const bOngoing = b.entry.end === null ? 1 : 0
      if (aOngoing !== bOngoing) return bOngoing - aOngoing
      return a.index - b.index
    })
    .map(({ entry }) => entry)
}

const months = (ym: string): number => {
  const [year, month] = ym.split('-').map(Number)
  return year * 12 + month
}

interface Span {
  /** Row where the branch forks off (its own row; larger index = older). */
  fork: number
  /** Row where it merges into master, or null when it runs to the top edge. */
  merge: number | null
  column: number
}

/**
 * Pure git-style branch layout. Rows are newest first. Column 0 is master;
 * every entry with a span forks off master at its start row and merges back at
 * the nearest row above that starts after its end. Columns are assigned
 * greedily and a column is busy from fork row through merge row inclusive.
 * Lane filtering only removes rows; it never reorders or moves columns.
 */
export function layoutGraph(
  commits: readonly TimelineEntry[],
  options: LayoutOptions = {}
): GraphLayout {
  const includeDrafts =
    options.includeDrafts ?? process.env.NODE_ENV !== 'production'
  const visible = commits.filter((c) => includeDrafts || !c.draft)
  const working = visible.filter((c) => c.tag === 'lab')
  const sorted = sortNewestFirst(visible.filter((c) => c.tag !== 'lab'))

  const candidates: { fork: number; merge: number | null; duration: number }[] = []
  sorted.forEach((entry, i) => {
    const { end } = entry
    if (end === undefined) return
    let merge: number | null = null
    if (end !== null) {
      for (let k = i - 1; k >= 0; k--) {
        if (sorted[k].start > end) {
          merge = k
          break
        }
      }
    }
    candidates.push({
      fork: i,
      merge,
      duration: end === null ? Infinity : months(end) - months(entry.start),
    })
  })

  // Colour intervals optimally (oldest first), then renumber the colour classes so
  // classes holding long-lived branches sit on the outer columns and short ones
  // beside master; fewer connectors then cross other branches.
  const classOf = new Map<number, number>()
  const classLongest: number[] = []
  const occupied: { from: number; to: number; cls: number }[] = []
  for (const { fork, merge, duration } of [...candidates].sort((a, b) => b.fork - a.fork)) {
    const top = merge ?? 0
    const taken = new Set(
      occupied.filter((o) => o.from <= fork && top <= o.to).map((o) => o.cls)
    )
    let cls = 0
    while (taken.has(cls)) cls++
    occupied.push({ from: top, to: fork, cls })
    classOf.set(fork, cls)
    classLongest[cls] = Math.max(classLongest[cls] ?? 0, duration)
  }
  const rank = classLongest
    .map((longest, cls) => ({ longest, cls }))
    .sort((a, b) => a.longest - b.longest || a.cls - b.cls)
    .map(({ cls }) => cls)
  const spans = new Map<number, Span>()
  for (const { fork, merge } of candidates) {
    spans.set(fork, { fork, merge, column: rank.indexOf(classOf.get(fork) ?? 0) + 1 })
  }

  const ref = (i: number): BranchRef => ({
    id: sorted[i].id,
    lane: sorted[i].lane,
    column: spans.get(i)?.column ?? 0,
  })

  const all: GraphRow[] = sorted.map((entry, i) => {
    const own = spans.get(i)
    const passing: BranchRef[] = []
    const merges: BranchRef[] = []
    spans.forEach((span, j) => {
      if (j === i) return
      const top = span.merge ?? -1
      if (span.merge === i) merges.push(ref(j))
      else if (top < i && i < j) passing.push(ref(j))
    })
    return {
      entry,
      kind: own ? 'branch' : 'point',
      column: own?.column ?? 0,
      masterBelow: i < sorted.length - 1,
      continuesUp: own ? entry.end === null || own.merge !== null : false,
      passing,
      merges,
    }
  })

  const lanes = options.lanes
  const rows = lanes ? all.filter((r) => lanes.includes(r.entry.lane)) : all
  const columns = 1 + Math.max(0, ...[...spans.values()].map((s) => s.column))
  return { rows, working: lanes ? working.filter((e) => lanes.includes(e.lane)) : working, columns }
}
