import type { GraphLayout } from '@/lib/timeline/types'
import { CommitRow } from './commit-row'
import { LogControls } from './log-controls'

export function CommitLog({ layout }: { layout: GraphLayout }) {
  const isTrunk = (row: GraphLayout['rows'][number]) =>
    row.entry.lane === 'work' && row.column === 0
  const first = layout.rows.findIndex(isTrunk)
  const last = layout.rows.findLastIndex(isTrunk)
  const ongoing = new Set(
    layout.rows.filter((r) => r.entry.end === null).map((r) => r.entry.id)
  )

  return (
    <LogControls>
      <ul className="m-0 list-none p-0">
        {layout.rows.map((row, i) => (
          <CommitRow
            key={row.entry.id}
            row={row}
            columns={layout.columns}
            ongoing={ongoing}
            trunk={{ up: first >= 0 && i > first && i <= last, down: i >= first && i < last }}
          />
        ))}
      </ul>
      <p className="mt-4 text-sm text-bp-muted">
        Filled dot: a role with a start and end. Hollow dot: a single release.
        Dashed: work in progress.
      </p>
    </LogControls>
  )
}
