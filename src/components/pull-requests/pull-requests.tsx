import Image from 'next/image'
import Link from 'next/link'
import '../hero/plotter.css'
import IDS from '@/constants/ids'
import { formatRange } from '@/lib/timeline/format'
import { getFeaturedEntries } from './featured'
import { MergedBadge } from './merged-badge'

const LINK =
  'font-mono text-sm text-bp-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent'

export function PullRequests() {
  const entries = getFeaturedEntries()

  return (
    <section
      id={IDS.pullRequests}
      aria-labelledby="pull-requests-heading"
      className="hero-grid bg-bp-bg px-4 py-16 text-bp-ink sm:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-8">
        <h2
          id="pull-requests-heading"
          className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl"
        >
          Pull requests
        </h2>
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-px border border-bp-line bg-bp-line md:grid-cols-2">
          {entries.map((entry) => {
            const image = entry.featured.images[0]
            return (
              <li key={entry.id} className="min-w-0">
                <article className="grid h-full min-w-0 grid-rows-[auto_auto_auto_auto_auto_auto_1fr] gap-2 bg-bp-surface p-4 md:p-5">
                  <div className="flex items-center gap-2">
                    <MergedBadge />
                    <span className="truncate font-mono text-xs text-bp-muted">
                      {formatRange(entry)}
                    </span>
                  </div>
                  <h3 className="truncate font-display text-xl font-bold uppercase leading-tight tracking-wide">
                    {entry.title}
                  </h3>
                  <p className="truncate font-mono text-xs text-bp-muted">{entry.org}</p>
                  <p className="line-clamp-2 min-h-[3em] text-sm leading-normal text-bp-muted">
                    {entry.plain}
                  </p>
                  <ul className="flex flex-nowrap gap-1.5 overflow-hidden">
                    {entry.stack.map((item) => (
                      <li
                        key={item}
                        className="whitespace-nowrap rounded border border-bp-line px-2 py-0.5 font-mono text-xs text-bp-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="aspect-[16/10] overflow-hidden border border-bp-line bg-bp-bg">
                    {image && (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        sizes="(min-width: 1152px) 540px, (min-width: 768px) 45vw, 100vw"
                        className="block h-full w-full object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-end gap-x-5 gap-y-2 self-end pt-1">
                    <Link href={`/pr/${entry.id}`} className={LINK}>
                      Read case study
                      <span className="sr-only"> for {entry.title}</span>
                    </Link>
                    {entry.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK}
                      >
                        {link.label}
                        <span className="sr-only"> for {entry.title} (opens in a new tab)</span>
                      </a>
                    ))}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
