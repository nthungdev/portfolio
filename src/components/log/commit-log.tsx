import type { GraphLayout } from '@/lib/timeline/types'
import { CommitRow } from './commit-row'
import { LogControls } from './log-controls'

export function CommitLog({ layout }: { layout: GraphLayout }) {
  const { working, rows, columns } = layout

  return (
    <LogControls>
      {working.length > 0 && (
        <details className="mb-4 rounded border border-dashed border-bp-line px-3 py-2">
          <summary className="cursor-pointer font-mono text-sm text-bp-muted">
            Uncommitted changes · {working.length} · working tree
          </summary>
          <ul className="m-0 mt-2 list-none p-0">
            {working.map((entry) => (
              <CommitRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </details>
      )}
      <ul className="m-0 list-none p-0">
        {rows.map((row) => (
          <CommitRow key={row.entry.id} entry={row.entry} graph={{ row, columns }} />
        ))}
      </ul>
      <p className="mt-4 text-sm text-bp-muted">
        Filled dot: a role or degree on its own branch. Hollow dot: a single
        release on master.
      </p>
    </LogControls>
  )
}
