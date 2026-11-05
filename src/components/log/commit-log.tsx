import type { GraphLayout } from '@/lib/timeline/types'
import { CommitRow, MergeRow } from './commit-row'
import { WorkingCell } from './graph-cell'
import { LogControls } from './log-controls'

export function CommitLog({ layout }: { layout: GraphLayout }) {
  const { working, rows, open, columns } = layout

  return (
    <LogControls>
      <ul className="m-0 list-none p-0">
        {working.length > 0 && (
          <li className="flex gap-3">
            <WorkingCell open={open} columns={columns} />
            <details className="group/wip min-w-0 flex-1 pb-3">
              <summary
                className="cursor-pointer list-none rounded pb-1 pt-3 font-mono text-sm text-bp-muted hover:bg-bp-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent [&::-webkit-details-marker]:hidden"
              >
                <span aria-hidden="true" className="mr-2 inline-block text-xs transition-transform duration-150 group-open/wip:rotate-90 motion-reduce:transition-none">
                  ▸
                </span>
                <span className="text-bp-ink">Uncommitted changes ({working.length})</span>
                <span className="italic"> · {working.map((e) => e.title).join(', ')}</span>
              </summary>
              <ul className="m-0 mt-1 list-none p-0">
                {working.map((entry) => (
                  <CommitRow key={entry.id} entry={entry} />
                ))}
              </ul>
            </details>
          </li>
        )}
        {rows.map((row) =>
          row.kind === 'merge' ? (
            <MergeRow key={row.key} row={row} columns={columns} />
          ) : (
            <CommitRow key={row.key} entry={row.entry} graph={{ row, columns }} />
          )
        )}
      </ul>
      <p className="mt-4 text-sm text-bp-muted">
        Each role or degree is a branch off main that merges back when it ends.
        Projects are commits on main. Hover a row to trace its branch.
      </p>
    </LogControls>
  )
}
