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

/** Line icons the tour's plotter can draw; paths live in `src/lib/tour/icons.ts`. */
export type StoryIcon =
  | 'phone' | 'cap' | 'chat' | 'shop' | 'key' | 'layout' | 'globe' | 'people'
  | 'chart' | 'home' | 'board' | 'ticket' | 'camera' | 'spark' | 'wave'

/** Guess-then-reveal question. `answer` indexes `options`. */
export interface StoryQuiz {
  question: string
  options: string[]
  answer: number
  /** Number counted up on reveal, e.g. 100000 with suffix `+`. */
  reveal: { value: number; prefix?: string; suffix?: string }
  caption: string
}

export interface StoryVideo {
  /** Muted loop under `/public`, H.264 MP4. */
  src: string
  poster: string
  width: number
  height: number
}

/** Optional extras for the stories tour; every field falls back to an automatic slide. */
export interface StoryExtras {
  icon?: StoryIcon
  /** Replaces `plain` as the slide text. */
  hook?: string
  /** Shown as a slide right before this entry's slide. */
  quiz?: StoryQuiz
  video?: StoryVideo
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
  /** Extras for the stories tour (icon, hook line, quiz, video). */
  story?: StoryExtras
  /** Name on the branch pill; defaults to `id`. */
  branch?: string
  head?: boolean
  draft?: boolean
}

export interface BranchRef {
  id: string
  /** Pill label (`entry.branch ?? entry.id`). */
  name: string
  lane: Lane
  /** Graph column, 1-based; column 0 is master. */
  column: number
  /** Index into the branch palette (`--branch-0` … `--branch-7`). */
  color: number
}

/**
 * `start`: a span's first commit on its own branch, forking off master.
 * `merge`: the master commit where an ended span merges back.
 * `point`: a single commit on master.
 */
export type RowKind = 'start' | 'merge' | 'point'

export interface GraphRow {
  /** Unique per row: `id`, or `id:merge` for merge rows. */
  key: string
  kind: RowKind
  entry: TimelineEntry
  /** The row's own branch for `start` and `merge` rows. */
  branch: BranchRef | null
  /** Other branches whose line runs through the full height of this row. */
  passing: BranchRef[]
  /** Master enters from the top edge. */
  masterAbove: boolean
  /** Master leaves through the bottom edge. */
  masterBelow: boolean
}

export interface GraphLayout {
  rows: GraphRow[]
  /** Uncommitted (`lab`) entries, shown as the top row. */
  working: TimelineEntry[]
  /** Ongoing branches, which run up through the working row to the top edge. */
  open: BranchRef[]
  /** Column count including master. */
  columns: number
}

export interface LayoutOptions {
  /** Keep only these lanes; order and columns are unaffected. */
  lanes?: readonly Lane[]
  /** Defaults to `NODE_ENV !== 'production'`. */
  includeDrafts?: boolean
}
