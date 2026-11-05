import { Fragment } from 'react'
import Link from 'next/link'
import './plotter.css'
import about from '@/content/about'
import timeline from '@/content/timeline'
import IDS from '@/constants/ids'
import { latestAtYear } from '@/lib/timeline/format'
import { IssueLink } from './issue-link'
import { PlotterStage } from './plotter-stage'
import {
  stepIndex,
  YEAR_MAX,
  YEAR_MIN,
  type ScrubData,
  type ScrubEntry,
} from './scrub-data'

const PLOT_ONCE_SCRIPT = `try{if(!sessionStorage.getItem('hero-plotted')){sessionStorage.setItem('hero-plotted','1');document.documentElement.setAttribute('data-plot','play')}}catch(e){}`

const BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded border px-4 text-center font-mono text-[13px] font-semibold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent'
const BUTTON_PRIMARY = `${BUTTON} border-bp-btn bg-bp-btn text-bp-btn-fg`
const BUTTON_OUTLINE = `${BUTTON} border-bp-line text-bp-ink hover:border-bp-accent`

const WORDS = ['Hung', 'Nguyen'] as const

function buildScrubData(): ScrubData {
  const entries: ScrubEntry[] = []
  const indexById = new Map<string, number>()
  const count = stepIndex(YEAR_MAX) + 1
  const steps = Array.from({ length: count }, (_, i) => {
    const entry = latestAtYear(timeline, YEAR_MIN + i / 10)
    if (!entry) return -1
    let index = indexById.get(entry.id)
    if (index === undefined) {
      index = entries.length
      indexById.set(entry.id, index)
      entries.push({
        id: entry.id,
        org: entry.org,
        title: entry.title,
        plain: entry.plain,
      })
    }
    return index
  })
  return { entries, steps }
}

function TitleBlock({ rev }: { rev: string }) {
  const cells: { label: string; value: string; wide?: boolean }[] = [
    { label: 'Title', value: `${about.name} · Full-stack engineer`, wide: true },
    { label: 'Drawn by', value: 'H. Nguyen' },
    { label: 'Location', value: about.location },
    { label: 'Rev', value: rev },
    { label: 'Sheet', value: '1 / 1' },
    { label: 'Status', value: about.status },
  ]
  return (
    <dl className="grid h-fit min-w-0 grid-cols-2 border border-bp-line bg-bp-surface sm:grid-cols-4">
      {cells.map(({ label, value, wide }) => (
        <div
          key={label}
          className={`min-w-0 border-b border-r border-bp-line p-3 [&:nth-last-child(-n+2)]:border-b-0 ${wide ? 'col-span-2' : ''}`}
        >
          <dt className="font-mono text-[11px] uppercase tracking-wider text-bp-muted">
            {label}
          </dt>
          <dd className="mt-1 break-words font-mono text-sm text-bp-ink">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PlotterHero() {
  const now = new Date()
  const rev = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}`

  return (
    <section
      id={IDS.hero}
      aria-label="Introduction"
      className="hero-grid relative overflow-hidden bg-bp-bg text-bp-ink"
    >
      <script dangerouslySetInnerHTML={{ __html: PLOT_ONCE_SCRIPT }} />
      <PlotterStage data={buildScrubData()} titleBlock={<TitleBlock rev={rev} />}>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
          <h1 className="plot-h1 font-display text-[clamp(3.5rem,19vw,5rem)] font-bold uppercase leading-none tracking-[0.01em] text-bp-ink md:text-[clamp(5rem,11vw,8.5rem)]">
            {WORDS.map((word, i) => (
              <Fragment key={word}>
                {i > 0 ? ' ' : null}
                <span className="relative block md:inline-block">
                  {word}
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                  >
                    <text className="plot-word" x="0" y="0.875em">
                      {word.toUpperCase()}
                    </text>
                  </svg>
                </span>
              </Fragment>
            ))}
          </h1>
          <div className="grid gap-1">
            <p className="text-xl font-semibold text-bp-ink">
              {about.title} at {about.company}
            </p>
            <p className="text-base text-bp-muted">
              Web, mobile and AI infrastructure. Shipping since 2018.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 [&>*]:max-sm:flex-1 [&>*]:max-sm:basis-40">
            <Link href="/resume" className={BUTTON_PRIMARY}>
              Open resume
            </Link>
            <a href={`#${IDS.pullRequests}`} className={BUTTON_OUTLINE}>
              Pull requests
            </a>
            <IssueLink className={BUTTON_OUTLINE}>Open an issue</IssueLink>
          </div>
        </div>
      </PlotterStage>
    </section>
  )
}
