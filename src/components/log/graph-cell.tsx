import type { BranchRef, GraphRow } from '@/lib/timeline/types'
import { branchColor, MASTER_COLOR } from './lanes'

const COL = 16
/** Node centre, measured from the top of the row. */
const NODE_Y = 22
/** Height of a fork or merge curve; rows are always taller than NODE_Y + CURVE. */
const CURVE = 18
const NODE = 10
const LINE = 2
const MASTER_LINE = 2.5

const centerX = (column: number): number => column * COL + COL / 2

function Strip({
  x,
  top,
  bottom,
  color,
  width = LINE,
  dashed = false,
  branch,
}: {
  x: number
  top: number | string
  bottom: number | string
  color: string
  width?: number
  dashed?: boolean
  branch?: string
}) {
  return (
    <span
      data-b={branch}
      className="absolute"
      style={{
        left: x - width / 2,
        width,
        top,
        bottom,
        background: dashed
          ? `repeating-linear-gradient(${color} 0 3px, transparent 3px 6px)`
          : color,
      }}
    />
  )
}

function Node({
  column,
  color,
  branch,
  hollow = false,
  dashed = false,
  head = false,
  size = NODE,
  y = NODE_Y,
  className = '',
}: {
  column: number
  color: string
  branch?: string
  hollow?: boolean
  dashed?: boolean
  head?: boolean
  size?: number
  y?: number
  className?: string
}) {
  return (
    <span
      data-b={branch}
      className={`absolute rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        top: y - size / 2,
        left: centerX(column) - size / 2,
        border: `2px ${dashed ? 'dotted' : 'solid'} ${color}`,
        backgroundColor: hollow ? 'var(--bp-bg)' : color,
        boxShadow: head
          ? `0 0 0 2px var(--bp-bg), 0 0 0 3.5px ${color}`
          : '0 0 0 2px var(--bp-bg)',
      }}
    />
  )
}

/** S-curve between two columns over the CURVE band below the node. */
function curve(fromX: number, toX: number): string {
  const mid = NODE_Y + CURVE / 2
  return `M${fromX} ${NODE_Y}C${fromX} ${mid} ${toX} ${mid} ${toX} ${NODE_Y + CURVE}`
}

function Passing({ branches }: { branches: BranchRef[] }) {
  return branches.map((b) => (
    <Strip key={b.id} x={centerX(b.column)} top={0} bottom={0} color={branchColor(b.color)} branch={b.id} />
  ))
}

interface GraphCellProps {
  columns: number
  /** Dims the node only; lines stay intact when a lane filter is off. */
  nodeClass?: string
}

/** One row of the graph. Lines are CSS strips, curves a small SVG; all positions come from layout data. */
export function GraphCell({ row, columns, nodeClass = '' }: GraphCellProps & { row: GraphRow }) {
  const { kind, branch, entry } = row
  const x0 = centerX(0)
  const masterEnd = kind === 'start' ? NODE_Y + CURVE : NODE_Y
  const own = branch ? branchColor(branch.color) : MASTER_COLOR
  const ownX = branch ? centerX(branch.column) : x0

  return (
    <div aria-hidden="true" className="relative shrink-0 self-stretch" style={{ width: columns * COL }}>
      <Strip
        x={x0}
        top={row.masterAbove ? 0 : NODE_Y}
        bottom={row.masterBelow ? 0 : `calc(100% - ${masterEnd}px)`}
        color={MASTER_COLOR}
        width={MASTER_LINE}
      />
      <Passing branches={row.passing} />
      {kind === 'start' && branch && (
        <Strip x={ownX} top={0} bottom={`calc(100% - ${NODE_Y}px)`} color={own} branch={branch.id} />
      )}
      {kind === 'merge' && branch && (
        <Strip x={ownX} top={NODE_Y + CURVE} bottom={0} color={own} branch={branch.id} />
      )}
      {branch && (
        <svg
          className="absolute left-0 top-0 overflow-visible"
          width={columns * COL}
          height={NODE_Y + CURVE}
          fill="none"
          strokeWidth={LINE}
          strokeLinecap="round"
        >
          <path
            data-b={branch.id}
            d={kind === 'start' ? curve(ownX, x0) : curve(x0, ownX)}
            stroke={own}
          />
        </svg>
      )}
      {kind === 'start' && !row.masterBelow && (
        <Node column={0} color={MASTER_COLOR} hollow size={8} y={NODE_Y + CURVE} />
      )}
      <Node
        column={kind === 'start' && branch ? branch.column : 0}
        color={kind === 'start' ? own : MASTER_COLOR}
        branch={branch?.id}
        head={entry.head}
        size={kind === 'merge' ? 9 : NODE}
        className={nodeClass}
      />
    </div>
  )
}

/** Top row for uncommitted work: dashed master and the ongoing branches running up to the top edge. */
export function WorkingCell({ open, columns }: { open: BranchRef[]; columns: number }) {
  const x0 = centerX(0)
  return (
    <div aria-hidden="true" className="relative shrink-0 self-stretch" style={{ width: columns * COL }}>
      <Strip x={x0} top={NODE_Y} bottom={0} color={MASTER_COLOR} width={MASTER_LINE} dashed />
      <Passing branches={open} />
      <Node column={0} color={MASTER_COLOR} hollow dashed />
    </div>
  )
}
