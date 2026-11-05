export type Lane = 'work' | 'education' | 'community' | 'project'

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

export interface LaneSegment {
  id: string
  lane: Lane
  column: number
}

export type RowKind = 'range' | 'point' | 'working'

export interface GraphRow {
  entry: TimelineEntry
  kind: RowKind
  column: number
  /** Own line continues upward from the node (range whose end is above this row). */
  continuesUp: boolean
  /** Branch elbow from column 0 into `column` at this row (work only). */
  fork: boolean
  /** Another branch merges back into column 0 at this row. */
  merge: boolean
  /** Lines that run through the full height of this row. */
  passing: LaneSegment[]
  /** Lines that end at this row's node height (cover the bottom half only). */
  ending: LaneSegment[]
}

export interface GraphLayout {
  rows: GraphRow[]
  /** Number of graph columns needed to draw every row. */
  columns: number
}

export interface LayoutOptions {
  /** Keep only these lanes; order and columns are unaffected. */
  lanes?: readonly Lane[]
  /** Defaults to `NODE_ENV !== 'production'`. */
  includeDrafts?: boolean
}
