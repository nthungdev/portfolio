import type {
  GraphLayout,
  GraphRow,
  Lane,
  LaneSegment,
  LayoutOptions,
  RowKind,
  TimelineEntry,
} from './types'

const FAR_FUTURE = '9999-12'

/** First column and max parallel columns per lane. */
const LANE_COLUMNS: Record<Lane, { base: number; max: number }> = {
  work: { base: 0, max: 3 },
  education: { base: 3, max: 1 },
  community: { base: 4, max: 2 },
  project: { base: 6, max: 1 },
}

const COLUMN_COUNT = 7

function kindOf(entry: TimelineEntry): RowKind {
  if (entry.tag === 'lab') return 'working'
  return entry.end === undefined ? 'point' : 'range'
}

function assignColumns(entries: TimelineEntry[]): Map<string, number> {
  const columns = new Map<string, number>()
  for (const lane of Object.keys(LANE_COLUMNS) as Lane[]) {
    const { base, max } = LANE_COLUMNS[lane]
    const colEnd: (string | null)[] = Array(max).fill(null)
    const ranged = entries
      .filter((e) => e.lane === lane && kindOf(e) === 'range')
      .sort((a, b) => a.start.localeCompare(b.start))
    for (const entry of ranged) {
      const end = entry.end ?? FAR_FUTURE
      let slot = colEnd.findIndex((c) => c === null || c <= entry.start)
      if (slot === -1) slot = max - 1
      colEnd[slot] = end
      columns.set(entry.id, base + slot)
    }
    for (const entry of entries) {
      if (entry.lane === lane && !columns.has(entry.id)) {
        columns.set(entry.id, base)
      }
    }
  }
  return columns
}

function sortNewestFirst(entries: TimelineEntry[]): TimelineEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const aLab = a.entry.tag === 'lab' ? 1 : 0
      const bLab = b.entry.tag === 'lab' ? 1 : 0
      if (aLab !== bLab) return bLab - aLab
      const byStart = b.entry.start.localeCompare(a.entry.start)
      if (byStart !== 0) return byStart
      const aOngoing = a.entry.end === null ? 1 : 0
      const bOngoing = b.entry.end === null ? 1 : 0
      if (aOngoing !== bOngoing) return bOngoing - aOngoing
      return a.index - b.index
    })
    .map(({ entry }) => entry)
}

/**
 * Pure commit-graph layout. Rows are newest first; overlapping work roles fork
 * into parallel columns; ongoing ranges run to the top. Filtering by lane never
 * reorders rows or moves columns.
 */
export function layoutGraph(
  commits: readonly TimelineEntry[],
  options: LayoutOptions = {}
): GraphLayout {
  const includeDrafts =
    options.includeDrafts ?? process.env.NODE_ENV !== 'production'
  const visible = commits.filter((c) => includeDrafts || !c.draft)
  const columnOf = assignColumns(visible)
  const lanes = options.lanes
  const sorted = sortNewestFirst(visible).filter(
    (e) => !lanes || lanes.includes(e.lane)
  )

  const topIndex = sorted.map((entry, i) => {
    if (kindOf(entry) !== 'range') return i
    if (entry.end === null || entry.end === undefined) return 0
    const end = entry.end
    const j = sorted.findIndex(
      (other) => other.tag !== 'lab' && other.start <= end
    )
    return j === -1 || j > i ? i : j
  })

  const rows: GraphRow[] = sorted.map((entry, i) => {
    const column = columnOf.get(entry.id) ?? 0
    const kind = kindOf(entry)
    const passing: LaneSegment[] = []
    const ending: LaneSegment[] = []
    let merge = false

    sorted.forEach((other, j) => {
      if (j === i || kindOf(other) !== 'range') return
      const top = topIndex[j]
      const segment: LaneSegment = {
        id: other.id,
        lane: other.lane,
        column: columnOf.get(other.id) ?? 0,
      }
      if (top < i && i < j) passing.push(segment)
      else if (top === i && top < j) {
        ending.push(segment)
        if (other.lane === 'work' && segment.column > 0 && other.end !== null) {
          merge = true
        }
      }
    })

    return {
      entry,
      kind,
      column,
      continuesUp: kind === 'range' && topIndex[i] < i,
      fork: kind === 'range' && entry.lane === 'work' && column > 0,
      merge,
      passing,
      ending,
    }
  })

  return { rows, columns: COLUMN_COUNT }
}
