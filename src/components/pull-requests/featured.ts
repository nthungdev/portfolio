import timeline from '@/content/timeline'
import type { TimelineEntry } from '@/lib/timeline/types'

export type FeaturedEntry = TimelineEntry & {
  featured: NonNullable<TimelineEntry['featured']>
}

const isFeatured = (entry: TimelineEntry): entry is FeaturedEntry =>
  entry.featured !== undefined &&
  !(entry.draft && process.env.NODE_ENV === 'production')

export const getFeaturedEntries = (): FeaturedEntry[] =>
  timeline.filter(isFeatured)

export const getFeaturedEntry = (id: string): FeaturedEntry | undefined =>
  getFeaturedEntries().find((entry) => entry.id === id)
