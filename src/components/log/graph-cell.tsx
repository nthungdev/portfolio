import type { GraphRow } from '@/lib/timeline/types'
import { LANE_COLOR } from './lanes'

const COL = 14
const NODE_Y = 22
const NODE = 10
/** Corner radius of merge elbows. */
const RADIUS = 6
/** Vertical offset between merges that land in the same row. */
const MERGE_STEP = 6
const MASTER_WIDTH = 3

const centerX = (column: number): number => column * COL + COL / 2

interface GraphCellProps {
  row: GraphRow
  columns: number
  /** Dims the node only; lines stay intact when a lane filter is off. */
  nodeClass?: string
}

function Strip({
  x,
  top,
  bottom,
  color,
  width = 2,
  opacity,
}: {
  x: number
  top: number | string
  bottom: number | string
  color: string
  width?: number
  opacity?: number
}) {
  return (
    <span
      className="absolute"
      style={{ left: x - width / 2, width, top, bottom, backgroundColor: color, opacity }}
    />
  )
}

/** Lane strips are CSS boxes; connectors are small fixed-size SVGs at the top of the cell. Positions come from layout data, never the DOM. */
export function GraphCell({ row, columns, nodeClass = '' }: GraphCellProps) {
  const { entry, kind, column } = row
  const color = LANE_COLOR[entry.lane]
  const x0 = centerX(0)
  const branch = kind === 'branch'

  const nodeStyle = branch
    ? { borderColor: color, backgroundColor: color }
    : { borderColor: color }

  // Nearest column lands lowest; farther ones stack upward so merges never cross each other.
  const merges = [...row.merges]
    .sort((a, b) => a.column - b.column)
    .map((m, k) => ({ ...m, y: NODE_Y - MERGE_STEP * (k + (branch ? 1 : 0)) }))

  return (
    <div
      aria-hidden="true"
      className="relative shrink-0 self-stretch"
      style={{ width: columns * COL }}
    >
      <Strip
        x={x0}
        top={0}
        bottom={row.masterBelow ? 0 : `calc(100% - ${NODE_Y}px)`}
        color="var(--bp-ink)"
        width={MASTER_WIDTH}
        opacity={0.55}
      />
      {row.passing.map((s) => (
        <Strip key={s.id} x={centerX(s.column)} top={0} bottom={0} color={LANE_COLOR[s.lane]} />
      ))}
      {branch && row.continuesUp && (
        <Strip x={centerX(column)} top={0} bottom={`calc(100% - ${NODE_Y}px)`} color={color} />
      )}
      {merges.map((m) => (
        <Strip key={m.id} x={centerX(m.column)} top={m.y + RADIUS} bottom={0} color={LANE_COLOR[m.lane]} />
      ))}
      <svg
        className="absolute left-0 top-0 overflow-visible"
        width={columns * COL}
        height={NODE_Y + RADIUS}
        fill="none"
        strokeWidth={2}
      >
        {branch && (
          <path
            d={`M${x0} ${NODE_Y}H${centerX(column)}`}
            stroke={color}
          />
        )}
        {merges.map((m) => {
          const cx = centerX(m.column)
          return (
            <path
              key={m.id}
              d={`M${cx} ${m.y + RADIUS}A${RADIUS} ${RADIUS} 0 0 0 ${cx - RADIUS} ${m.y}H${x0}`}
              stroke={LANE_COLOR[m.lane]}
            />
          )
        })}
      </svg>
      <span
        className={`absolute rounded-full border-2 bg-bp-bg ${nodeClass}`}
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
