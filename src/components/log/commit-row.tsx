import Link from 'next/link'
import { commitAnchor } from '@/constants/ids'
import { formatRange, shortSha } from '@/lib/timeline/format'
import type { GraphRow, Lane } from '@/lib/timeline/types'
import { GraphCell, type Trunk } from './graph-cell'
import { FOCUS_RING, LANE_COLOR } from './lanes'

/** Static class strings so Tailwind can see them; driven by `data-off-*` on the log wrapper. */
const DIM: Record<Lane, string> = {
  work: 'group-data-[off-work]/log:opacity-30',
  education: 'group-data-[off-education]/log:opacity-30',
  community: 'group-data-[off-community]/log:opacity-30',
  project: 'group-data-[off-project]/log:opacity-30',
}

const CHIP =
  'rounded border border-bp-line px-1.5 py-0.5 font-mono text-xs text-bp-muted'

interface CommitRowProps {
  row: GraphRow
  columns: number
  ongoing?: ReadonlySet<string>
  trunk?: Trunk
}

export function CommitRow({ row, columns, ongoing, trunk }: CommitRowProps) {
  const { entry } = row
  const open = entry.head === true
  const panelId = `panel-${entry.id}`

  return (
    <li
      id={commitAnchor(entry.id)}
      data-lane={entry.lane}
      data-open={String(open)}
      className={`group/row flex scroll-mt-24 gap-3 transition-opacity duration-200 motion-reduce:transition-none ${DIM[entry.lane]}`}
    >
      <GraphCell row={row} columns={columns} ongoing={ongoing} trunk={trunk} />
      <div className="min-w-0 flex-1 pb-3">
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
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-xs text-bp-muted">{shortSha(entry.id)}</span>
              <span className="font-sans font-semibold text-bp-ink">{entry.title}</span>
              {entry.head && (
                <span className="rounded border border-bp-accent px-1 font-mono text-xs text-bp-accent">
                  HEAD
                </span>
              )}
            </span>
            <span className="mt-0.5 flex flex-wrap gap-x-2 text-sm text-bp-muted">
              <span style={{ color: LANE_COLOR[entry.lane] }} className="font-mono text-xs">
                {entry.lane}
              </span>
              <span>{entry.org}</span>
              <span className="font-mono text-xs">{formatRange(entry)}</span>
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
