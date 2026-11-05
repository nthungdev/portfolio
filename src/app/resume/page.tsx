import type { Metadata } from 'next'
import Link from 'next/link'
import about from '@/content/about'
import skills from '@/content/skills'
import timeline from '@/content/timeline'
import { formatRange } from '@/lib/timeline/format'
import type { Lane, TimelineEntry } from '@/lib/timeline/types'

export const metadata: Metadata = {
  title: 'Resume · Hung Nguyen',
  description: 'Resume of Hung Nguyen, full-stack software engineer.',
}

const PRINT_CSS = `
@page { margin: 0.6in; }
@media print {
  body { background: #fff !important; }
  .resume-root {
    --bp-bg: #fff; --bp-surface: #fff; --bp-ink: #000; --bp-muted: #333;
    --bp-line: #999; --bp-accent: #000; --bp-grid: transparent;
    background: #fff !important; color: #000; font-size: 10.5pt;
  }
  .resume-entry { break-inside: avoid; }
}
`

const visible = (entry: TimelineEntry) =>
  entry.tag !== 'lab' && !(entry.draft && process.env.NODE_ENV === 'production')

const SECTIONS: { lane: Lane; title: string }[] = [
  { lane: 'work', title: 'Experience' },
  { lane: 'education', title: 'Education' },
  { lane: 'community', title: 'Community' },
]

const byStartDesc = (a: TimelineEntry, b: TimelineEntry) =>
  b.start.localeCompare(a.start)

const hostOf = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

function Entry({ entry }: { entry: TimelineEntry }) {
  return (
    <article className="resume-entry grid gap-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="font-semibold">
          {entry.title}
          <span className="font-normal text-bp-muted"> · {entry.org}</span>
        </h3>
        <p className="font-mono text-xs text-bp-muted">{formatRange(entry)}</p>
      </div>
      <ul className="list-disc space-y-0.5 pl-5 text-sm">
        {entry.diff.add.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {entry.stack.length > 0 && (
        <p className="font-mono text-xs text-bp-muted">
          {entry.stack.join(' · ')}
        </p>
      )}
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="border-b border-bp-line pb-1 font-display text-lg font-bold uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ResumePage() {
  const entries = timeline.filter(visible)
  const projects = entries
    .filter((e) => e.featured)
    .sort(byStartDesc)
  const github = about.socialLinks.find((l) => l.name === 'GitHub')
  const linkedin = about.socialLinks.find((l) => l.name === 'LinkedIn')

  return (
    <main className="resume-root min-h-screen px-4 py-10 sm:px-8 print:p-0">
      <style>{PRINT_CSS}</style>
      <div className="mx-auto grid max-w-3xl gap-8 rounded border border-bp-line bg-bp-surface p-5 sm:p-10 print:max-w-none print:border-0 print:p-0">
        <header className="grid gap-2">
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide">
            {about.name}
          </h1>
          <p className="text-bp-muted">
            {about.title}, {about.company}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm">
            <a className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent" href={`mailto:${about.email}`}>
              {about.email}
            </a>
            <span>{about.location}</span>
            {github && (
              <a className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent" href={github.url}>
                {hostOf(github.url)}
              </a>
            )}
            {linkedin && (
              <a className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent" href={linkedin.url}>
                {hostOf(linkedin.url)}
              </a>
            )}
          </p>
          <p className="mt-2 flex flex-wrap gap-3 print:hidden">
            <a
              href={about.resumeEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-bp-btn px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wide text-bp-btn-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bp-surface"
            >
              Download PDF
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <Link
              href="/"
              className="rounded border border-bp-line px-4 py-2 font-mono text-sm uppercase tracking-wide hover:border-bp-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent"
            >
              Back to site
            </Link>
          </p>
        </header>

        {SECTIONS.map(({ lane, title }) => {
          const items = entries.filter((e) => e.lane === lane).sort(byStartDesc)
          return items.length ? (
            <Section key={lane} title={title}>
              {items.map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
            </Section>
          ) : null
        })}

        {projects.length > 0 && (
          <Section title="Featured projects">
            {projects.map((entry) => (
              <div key={entry.id} className="grid gap-1">
                <Entry entry={entry} />
                {entry.links.length > 0 && (
                  <p className="font-mono text-xs">
                    {entry.links.map((link, i) => (
                      <span key={link.href}>
                        {i > 0 && ' · '}
                        <a className="underline" href={link.href}>
                          {hostOf(link.href)}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </Section>
        )}

        <Section title="Skills">
          <dl className="grid gap-1 text-sm">
            {skills.map((layer) => (
              <div key={layer.id} className="sm:flex sm:gap-3">
                <dt className="font-semibold sm:w-44 sm:shrink-0">{layer.label}</dt>
                <dd className="text-bp-muted print:text-black">{layer.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </main>
  )
}
