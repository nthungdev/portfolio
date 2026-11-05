import type { GraphRow } from '@/lib/timeline/types'
import { LANE_COLOR } from './lanes'

const COL = 12
const NODE_Y = 22
const NODE = 10
const ELBOW = 8

const centerX = (column: number): number => column * COL + COL / 2

interface GraphCellProps {
  row: GraphRow
  columns: number
}

/** Pure-CSS lane strips and SVG elbows; positions come from layout data, never the DOM. */
export function GraphCell({ row, columns }: GraphCellProps) {
  const { entry, kind, column } = row
  const color = LANE_COLOR[entry.lane]
  const x0 = centerX(0)
  const mergeFrom = row.merge
    ? row.ending.filter((s) => s.lane === 'work' && s.column > 0)
    : []

  const nodeStyle =
    kind === 'point'
      ? { borderColor: color }
      : kind === 'working'
        ? { borderColor: color, borderStyle: 'dashed' as const }
        : { borderColor: color, backgroundColor: color }

  return (
    <div
      aria-hidden="true"
      className="relative shrink-0 self-stretch"
      style={{ width: columns * COL }}
    >
      {row.passing.map((s) => (
        <span
          key={s.id}
          className="absolute bottom-0 top-0 w-0.5"
          style={{ left: centerX(s.column) - 1, backgroundColor: LANE_COLOR[s.lane] }}
        />
      ))}
      {row.ending.map((s) => (
        <span
          key={s.id}
          className="absolute bottom-0 w-0.5"
          style={{
            top: NODE_Y,
            left: centerX(s.column) - 1,
            backgroundColor: LANE_COLOR[s.lane],
          }}
        />
      ))}
      {row.continuesUp && (
        <span
          className="absolute top-0 w-0.5"
          style={{ height: NODE_Y, left: centerX(column) - 1, backgroundColor: color }}
        />
      )}
      {(row.fork || mergeFrom.length > 0) && (
        <svg
          className="absolute left-0 top-0 overflow-visible"
          width={columns * COL}
          height={NODE_Y + ELBOW}
          fill="none"
          stroke={LANE_COLOR.work}
          strokeWidth={2}
        >
          {row.fork && (
            <path
              d={`M${x0} ${NODE_Y + ELBOW} Q${x0} ${NODE_Y} ${x0 + ELBOW} ${NODE_Y} H${centerX(column)}`}
            />
          )}
          {mergeFrom.map((s) => (
            <path
              key={s.id}
              d={`M${centerX(s.column)} ${NODE_Y} H${x0 + ELBOW} Q${x0} ${NODE_Y} ${x0} ${NODE_Y - ELBOW}`}
            />
          ))}
        </svg>
      )}
      <span
        className="absolute rounded-full border-2 bg-bp-bg"
        style={{
          width: NODE,
          height: NODE,
          top: NODE_Y - NODE / 2,
          left: centerX(column) - NODE / 2,
          ...nodeStyle,
          ...(entry.head
            ? { outline: '2px solid var(--bp-accent)', outlineOffset: 2 }
            : null),
        }}
      />
    </div>
  )
}
