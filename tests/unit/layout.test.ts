import { describe, expect, it } from 'vitest'
import timeline from '@/content/timeline'
import { layoutGraph } from '@/lib/timeline/layout'

describe('layoutGraph', () => {
  it('returns one row per entry', () => {
    const { rows } = layoutGraph(timeline, { includeDrafts: true })
    expect(rows).toHaveLength(timeline.length)
  })
})
