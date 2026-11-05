import type {
  BranchRef,
  GraphLayout,
  GraphRow,
  LayoutOptions,
  RowKind,
  TimelineEntry,
} from './types'

/** Number of `--branch-N` colours defined in globals.css. */
export const BRANCH_COLORS = 8

const months = (ym: string): number => {
  const [year, month] = ym.split('-').map(Number)
  return year * 12 + month
}

interface Event {
  kind: RowKind
  entry: TimelineEntry
  at: number
  index: number
}

/** At equal months a merge sits above a point, and a point above a branch start. */
const KIND_ORDER: Record<RowKind, number> = { merge: 0, point: 1, start: 2 }

interface Span {
  entry: TimelineEntry
  /** Top row the branch occupies: its merge row, or -1 when it runs to the top edge. */
  top: number
  /** Its start row. */
  bottom: number
  column: number
  color: number
}

/**
 * Pure Git Graph-style layout. Every entry with an `end` key is a branch: a
 * `start` row on its own column and, once it has ended, a `merge` row on
 * master. Entries without `end` are commits on master. Rows are newest first.
 * Columns are packed top-down so a column is reused once its branch has
 * forked, and each branch takes the next palette colour not used by a branch
 * it overlaps. Everything is derived from the entries, so content edits never
 * need component changes.
 */
export function layoutGraph(
  commits: readonly TimelineEntry[],
  options: LayoutOptions = {}
): GraphLayout {
  const includeDrafts =
    options.includeDrafts ?? process.env.NODE_ENV !== 'production'
  const visible = commits.filter((c) => includeDrafts || !c.draft)
  const working = visible.filter((c) => c.tag === 'lab')

  const events: Event[] = []
  visible
    .filter((c) => c.tag !== 'lab')
    .forEach((entry, index) => {
      if (entry.end === undefined) {
        events.push({ kind: 'point', entry, at: months(entry.start), index })
        return
      }
      events.push({ kind: 'start', entry, at: months(entry.start), index })
      if (entry.end !== null) events.push({ kind: 'merge', entry, at: months(entry.end), index })
    })
  events.sort(
    (a, b) =>
      b.at - a.at ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      Number(b.entry.end === null) - Number(a.entry.end === null) ||
      a.index - b.index
  )

  const spans = new Map<string, Span>()
  events.forEach((event, row) => {
    if (event.kind === 'point') return
    const span = spans.get(event.entry.id) ?? {
      entry: event.entry,
      top: -1,
      bottom: -1,
      column: 0,
      color: 0,
    }
    if (event.kind === 'merge') span.top = row
    else span.bottom = row
    spans.set(event.entry.id, span)
  })

  const overlaps = (a: Span, b: Span) => a.top <= b.bottom && b.top <= a.bottom
  const ordered = [...spans.values()].sort(
    (a, b) => a.top - b.top || b.bottom - a.bottom
  )
  const done: Span[] = []
  let nextColor = 0
  for (const span of ordered) {
    const rivals = done.filter((d) => overlaps(d, span))
    let column = 1
    while (rivals.some((r) => r.column === column)) column++
    span.column = column
    const usedColors = new Set(rivals.map((r) => r.color))
    let color = nextColor
    for (let n = 0; n < BRANCH_COLORS && usedColors.has(color); n++) {
      color = (color + 1) % BRANCH_COLORS
    }
    span.color = color
    nextColor = (color + 1) % BRANCH_COLORS
    done.push(span)
  }

  const ref = (span: Span): BranchRef => ({
    id: span.entry.id,
    name: span.entry.branch ?? span.entry.id,
    lane: span.entry.lane,
    column: span.column,
    color: span.color,
  })

  const lanes = options.lanes
  const keep = (entry: TimelineEntry) => !lanes || lanes.includes(entry.lane)
  const shownWorking = working.filter(keep)
  const last = events.length - 1

  const all: GraphRow[] = events.map((event, row) => {
    const own = event.kind === 'point' ? undefined : spans.get(event.entry.id)
    return {
      key: event.kind === 'merge' ? `${event.entry.id}:merge` : event.entry.id,
      kind: event.kind,
      entry: event.entry,
      branch: own ? ref(own) : null,
      passing: [...spans.values()]
        .filter((s) => s !== own && s.top < row && row < s.bottom)
        .sort((a, b) => a.column - b.column)
        .map(ref),
      masterAbove: row > 0 || shownWorking.length > 0,
      masterBelow: row < last,
    }
  })

  const rows = all.filter((r) => keep(r.entry))
  const open = [...spans.values()].filter((s) => s.top === -1).map(ref)
  const columns = 1 + Math.max(0, ...[...spans.values()].map((s) => s.column))
  return { rows, working: shownWorking, open, columns }
}
