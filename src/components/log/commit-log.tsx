import type { GraphLayout } from '@/lib/timeline/types'
import { CommitRow } from './commit-row'
import { LogControls } from './log-controls'

export function CommitLog({ layout }: { layout: GraphLayout }) {
  return (
    <LogControls>
      <ul className="m-0 list-none p-0">
        {layout.rows.map((row) => (
          <CommitRow key={row.entry.id} row={row} columns={layout.columns} />
        ))}
      </ul>
      <p className="mt-4 text-sm text-bp-muted">
        Filled dot: a role with a start and end. Hollow dot: a single release.
        Dashed: work in progress.
      </p>
    </LogControls>
  )
}
