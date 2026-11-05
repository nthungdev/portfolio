import type { Lane } from '@/lib/timeline/types'

export const LANES: readonly Lane[] = ['work', 'education', 'project']

export const LANE_COLOR: Record<Lane, string> = {
  work: 'var(--lane-work)',
  education: 'var(--lane-edu)',
  project: 'var(--lane-proj)',
}

export const LANE_LABEL: Record<Lane, string> = {
  work: 'Work',
  education: 'School',
  project: 'Projects',
}

export const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent'

/** Branch palette colour; the `--branch-N` tokens live in globals.css. */
export const branchColor = (index: number): string => `var(--branch-${index})`

export const MASTER_COLOR = 'var(--bp-accent)'
