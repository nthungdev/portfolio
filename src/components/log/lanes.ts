import type { Lane } from '@/lib/timeline/types'

export const LANES: readonly Lane[] = ['work', 'education', 'community', 'project']

export const LANE_COLOR: Record<Lane, string> = {
  work: 'var(--lane-work)',
  education: 'var(--lane-edu)',
  community: 'var(--lane-com)',
  project: 'var(--lane-proj)',
}

export const LANE_LABEL: Record<Lane, string> = {
  work: 'Work',
  education: 'School',
  community: 'Community',
  project: 'Projects',
}

export const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent'
