export type Lane = 'work' | 'education' | 'project'

/** Calendar month as `YYYY-MM`. */
export type YearMonth = string

export interface TimelineImage {
  src: string
  width: number
  height: number
  alt: string
}

export interface TimelineLink {
  label: string
  href: string
}

export interface TimelineEntry {
  id: string
  lane: Lane
  title: string
  org: string
  start: YearMonth
  /** `undefined` = single point in time (release); `null` = ongoing. */
  end?: YearMonth | null
  diff: { add: string[]; del?: string[] }
  /** One plain-English sentence for non-technical readers. */
  plain: string
  stack: string[]
  links: TimelineLink[]
  /** Featured entries get a `/pr/[id]` page. */
  featured?: { images: TimelineImage[] }
  /** `lab` entries render as uncommitted working-tree rows at the top. */
  tag?: 'lab'
  head?: boolean
  draft?: boolean
}

export interface BranchRef {
  id: string
  lane: Lane
  /** Graph column, 1-based; column 0 is master. */
  column: number
}

export type RowKind = 'branch' | 'point'

export interface GraphRow {
  entry: TimelineEntry
  /** `branch`: a span with its own column; `point`: a commit on master. */
  kind: RowKind
  /** 0 for points, otherwise the branch column. */
  column: number
  /** Master continues below this row (false only for the oldest row). */
  masterBelow: boolean
  /** Own branch line runs up from the node (merge or top edge lies above). */
  continuesUp: boolean
  /** Other branches running through the full height of this row. */
  passing: BranchRef[]
  /** Branches that curve back into master at the bottom of this row. */
  merges: BranchRef[]
}

export interface GraphLayout {
  rows: GraphRow[]
  /** Uncommitted (`lab`) entries, shown above the graph. */
  working: TimelineEntry[]
  /** Column count including master. */
  columns: number
}

export interface LayoutOptions {
  /** Keep only these lanes; order and columns are unaffected. */
  lanes?: readonly Lane[]
  /** Defaults to `NODE_ENV !== 'production'`. */
  includeDrafts?: boolean
}
