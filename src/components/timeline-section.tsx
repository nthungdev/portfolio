import IDS from '@/constants/ids'
import timeline from '@/content/timeline'
import { layoutGraph } from '@/lib/timeline/layout'
import { CommitLog } from './log/commit-log'
import { ViewSwitch } from './log/view-switch'
import { TimeMachine } from './time-machine/time-machine'

export function TimelineSection() {
  const layout = layoutGraph(timeline)
  const dated = layout.rows
    .filter((row) => row.kind !== 'merge')
    .map((row) => row.entry)
    .sort((a, b) => b.start.localeCompare(a.start))
  const entries = [...layout.working, ...dated]

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
        <ViewSwitch
          log={<CommitLog layout={layout} />}
          machine={<TimeMachine entries={entries} />}
        />
      </div>
    </section>
  )
}
