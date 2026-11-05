import Link from 'next/link'
import { commitAnchor } from '@/constants/ids'
import { formatMonth, formatRange, shortSha } from '@/lib/timeline/format'
import type { BranchRef, GraphRow, Lane, TimelineEntry } from '@/lib/timeline/types'
import { GraphCell } from './graph-cell'
import { branchColor, FOCUS_RING, LANE_COLOR } from './lanes'

/** Static class strings so Tailwind can see them; driven by `data-off-*` on the log wrapper. */
const DIM: Record<Lane, string> = {
  work: 'group-data-[off-work]/log:opacity-30',
  education: 'group-data-[off-education]/log:opacity-30',
  project: 'group-data-[off-project]/log:opacity-30',
}

const BRANCH_ICON = (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="4.5" cy="3.5" r="1.8" />
    <circle cx="4.5" cy="12.5" r="1.8" />
    <circle cx="11.5" cy="4.5" r="1.8" />
    <path d="M4.5 5.3v5.4M11.5 6.3c0 3.2-7 2.2-7 4.4" />
  </svg>
)

/** Git Graph-style branch label: coloured icon segment plus the branch name. */
export function BranchPill({ branch, head }: { branch: BranchRef; head?: boolean }) {
  const color = branchColor(branch.color)
  return (
    <span
      className="inline-flex h-5 shrink-0 overflow-hidden rounded border-[1.5px] font-mono text-xs leading-none"
      style={{
        borderColor: color,
        boxShadow: head ? `0 0 0 2px var(--bp-bg), 0 0 0 3.5px ${color}` : undefined,
      }}
    >
      <span className="grid w-5 place-items-center text-bp-bg" style={{ backgroundColor: color }}>
        {BRANCH_ICON}
      </span>
      <span className="grid place-items-center bg-bp-surface px-1.5 text-bp-ink">
        <span className="sr-only">branch </span>
        {branch.name}
      </span>
    </span>
  )
}

const CHIP =
  'rounded border border-bp-line px-1.5 py-0.5 font-mono text-xs text-bp-muted'

interface CommitRowProps {
  entry: TimelineEntry
  /** Omitted for uncommitted (working tree) rows, which have no graph. */
  graph?: { row: GraphRow; columns: number }
}

export function CommitRow({ entry, graph }: CommitRowProps) {
  const branch = graph?.row.branch ?? null
  const open = entry.head === true
  const fade = `transition-opacity duration-200 motion-reduce:transition-none ${DIM[entry.lane]}`
  const panelId = `panel-${entry.id}`

  return (
    <li
      id={commitAnchor(entry.id)}
      data-lane={entry.lane}
      data-open={String(open)}
      data-branch={branch?.id}
      className="group/row flex scroll-mt-24 gap-3"
    >
      {graph && <GraphCell row={graph.row} columns={graph.columns} nodeClass={fade} />}
      <div className={`min-w-0 flex-1 pb-3 ${fade}`}>
        <button
          type="button"
          data-row=""
          aria-expanded={open}
          aria-controls={panelId}
          className={`flex w-full items-start gap-2 rounded pb-1 pt-3 text-left hover:bg-bp-surface ${FOCUS_RING}`}
        >
          <span
            aria-hidden="true"
            className="mt-0.5 font-mono text-xs text-bp-muted transition-transform duration-150 group-data-[open=true]/row:rotate-90 motion-reduce:transition-none"
          >
            ▸
          </span>
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            {branch ? (
              <BranchPill branch={branch} head={entry.head} />
            ) : (
              <span className="font-mono text-xs text-bp-muted">{shortSha(entry.id)}</span>
            )}
            <span className="font-sans font-semibold text-bp-ink">{entry.title}</span>
            <span className="text-sm text-bp-muted">{entry.org}</span>
            {entry.head && (
              <span className="rounded border border-bp-accent px-1 font-mono text-xs text-bp-accent">
                HEAD
              </span>
            )}
            <span className="flex items-center gap-2 sm:ml-auto">
              <span
                className="rounded-sm border px-1 font-mono text-[10.5px] uppercase tracking-wider"
                style={{ color: LANE_COLOR[entry.lane], borderColor: LANE_COLOR[entry.lane] }}
              >
                {entry.lane === 'education' ? 'school' : entry.lane}
              </span>
              <span className="font-mono text-xs tabular-nums text-bp-muted">{formatRange(entry)}</span>
            </span>
          </span>
        </button>
        <div
          id={panelId}
          className="ml-5 hidden border-l border-bp-line pl-3 pt-2 group-data-[open=true]/row:block"
        >
          <ul className="space-y-1 font-mono text-sm">
            {entry.diff.del?.map((line) => (
              <li key={`-${line}`} className="text-bp-del">
                <span aria-hidden="true">- </span>
                <span className="sr-only">Removed: </span>
                {line}
              </li>
            ))}
            {entry.diff.add.map((line) => (
              <li key={`+${line}`} className="text-bp-add">
                <span aria-hidden="true">+ </span>
                <span className="sr-only">Added: </span>
                {line}
              </li>
            ))}
          </ul>
          {entry.stack.length > 0 && (
            <ul aria-label="Stack" className="mt-3 flex flex-wrap gap-1.5">
              {entry.stack.map((item) => (
                <li key={item} className={CHIP}>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {(entry.links.length > 0 || entry.featured) && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm">
              {entry.featured && (
                <li>
                  <Link
                    href={`/pr/${entry.id}`}
                    className={`rounded text-bp-accent underline underline-offset-2 ${FOCUS_RING}`}
                  >
                    Read the write-up
                  </Link>
                </li>
              )}
              {entry.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded text-bp-accent underline underline-offset-2 ${FOCUS_RING}`}
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  )
}

/** Master commit where an ended branch merges back. Not interactive. */
export function MergeRow({ row, columns }: { row: GraphRow; columns: number }) {
  const { entry, branch } = row
  const fade = `transition-opacity duration-200 motion-reduce:transition-none ${DIM[entry.lane]}`
  return (
    <li data-lane={entry.lane} data-branch={branch?.id} className="flex min-h-11 gap-3">
      <GraphCell row={row} columns={columns} nodeClass={fade} />
      <p
        className={`flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 pb-2 pl-5 pt-3 font-mono text-xs text-bp-muted ${fade}`}
      >
        <span className="min-w-0">
          Merge branch &apos;{branch?.name ?? entry.id}&apos; into main
        </span>
        {entry.end && <span className="tabular-nums sm:ml-auto">{formatMonth(entry.end)}</span>}
      </p>
    </li>
  )
}
