import IDS from '@/constants/ids'
import about from '@/content/about'
import highlights from '@/content/highlights'
import skills from '@/content/skills'
import timeline from '@/content/timeline'
import tour from '@/content/tour'
import { layoutGraph } from '@/lib/timeline/layout'
import { buildTour, isGroupNew } from '@/lib/tour/build-tour'
import { CommitLog } from './log/commit-log'
import { ViewSwitch } from './log/view-switch'
import { TimeMachine } from './time-machine/time-machine'
import { TourRings } from './tour/tour-rings'
import type { TourGroupSummary } from './tour/tour-rings'

export function TimelineSection() {
  const layout = layoutGraph(timeline)
  const dated = layout.rows
    .filter((row) => row.kind !== 'merge')
    .map((row) => row.entry)
    .sort((a, b) => b.start.localeCompare(a.start))
  const entries = [...layout.working, ...dated]
  const now = new Date()
  const groups: TourGroupSummary[] = buildTour({
    about,
    timeline,
    highlights,
    skills,
    copy: tour,
    portrait: '/me.jpg',
  }).map((group) => ({
    id: group.id,
    name: group.name,
    badge: group.badge,
    isNew: isGroupNew(group, now),
  }))

  return (
    <section
      id={IDS.log}
      aria-labelledby="log-heading"
      className="scroll-mt-16 px-4 py-12 sm:px-8 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-sm text-bp-muted">git log --graph</p>
        <h2
          id="log-heading"
          className="mb-6 font-display text-3xl font-bold uppercase tracking-wide text-bp-ink md:text-4xl"
        >
          Career log
        </h2>
        <TourRings groups={groups} />
        <ViewSwitch
          log={<CommitLog layout={layout} />}
          machine={<TimeMachine entries={entries} />}
        />
      </div>
    </section>
  )
}
