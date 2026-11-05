import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import IDS from '@/constants/ids'
import { formatRange } from '@/lib/timeline/format'
import {
  getFeaturedEntries,
  getFeaturedEntry,
} from '@/components/pull-requests/featured'
import { MergedBadge } from '@/components/pull-requests/merged-badge'

interface PageProps {
  params: Promise<{ slug: string }>
}

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent'

export function generateStaticParams(): { slug: string }[] {
  return getFeaturedEntries().map((entry) => ({ slug: entry.id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getFeaturedEntry(slug)
  if (!entry) return {}
  return {
    title: `${entry.title} · Hung Nguyen`,
    description: entry.plain,
    alternates: { canonical: `/pr/${entry.id}` },
  }
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const entry = getFeaturedEntry(slug)
  if (!entry) notFound()

  return (
    <main className="hero-grid min-h-screen bg-bp-bg px-4 py-12 text-bp-ink md:px-6">
      <article className="mx-auto grid max-w-4xl gap-10">
        <Link
          href={`/#${IDS.pullRequests}`}
          className={`w-fit font-mono text-sm text-bp-accent underline-offset-4 hover:underline ${FOCUS}`}
        >
          ← Back to pull requests
        </Link>

        <header className="grid gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <MergedBadge />
            <span className="font-mono text-xs text-bp-muted">
              {formatRange(entry)}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold uppercase leading-tight tracking-wide md:text-6xl">
            {entry.title}
          </h1>
          <p className="font-mono text-sm text-bp-muted">{entry.org}</p>
        </header>

        <section aria-labelledby="summary-heading" className="grid gap-3">
          <h2
            id="summary-heading"
            className="font-mono text-xs uppercase tracking-wider text-bp-muted"
          >
            Summary
          </h2>
          <p className="max-w-[65ch] text-lg">{entry.plain}</p>
        </section>

        <section aria-labelledby="changes-heading" className="grid gap-3">
          <h2
            id="changes-heading"
            className="font-mono text-xs uppercase tracking-wider text-bp-muted"
          >
            What changed
          </h2>
          <ul className="grid gap-2 border border-bp-line bg-bp-surface p-4 font-mono text-sm">
            {entry.diff.add.map((line) => (
              <li key={`add-${line}`} className="flex gap-3">
                <span aria-hidden="true" className="text-bp-add">+</span>
                <span className="sr-only">Added: </span>
                <span className="min-w-0 break-words">{line}</span>
              </li>
            ))}
            {entry.diff.del?.map((line) => (
              <li key={`del-${line}`} className="flex gap-3">
                <span aria-hidden="true" className="text-bp-del">−</span>
                <span className="sr-only">Removed: </span>
                <span className="min-w-0 break-words">{line}</span>
              </li>
            ))}
          </ul>
        </section>

        {entry.featured.images.length > 0 && (
          <section aria-labelledby="screens-heading" className="grid gap-3">
            <h2
              id="screens-heading"
              className="font-mono text-xs uppercase tracking-wider text-bp-muted"
            >
              Screenshots
            </h2>
            {entry.featured.images.map((image) => (
              <Image
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 896px) 864px, 100vw"
                className="h-auto w-full border border-bp-line"
              />
            ))}
          </section>
        )}

        <section aria-labelledby="stack-heading" className="grid gap-3">
          <h2
            id="stack-heading"
            className="font-mono text-xs uppercase tracking-wider text-bp-muted"
          >
            Stack
          </h2>
          <ul className="flex flex-wrap gap-2">
            {entry.stack.map((item) => (
              <li
                key={item}
                className="rounded border border-bp-line px-2 py-0.5 font-mono text-xs"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {entry.links.length > 0 && (
          <section aria-labelledby="links-heading" className="grid gap-3">
            <h2
              id="links-heading"
              className="font-mono text-xs uppercase tracking-wider text-bp-muted"
            >
              Links
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {entry.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-mono text-sm text-bp-accent underline-offset-4 hover:underline ${FOCUS}`}
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  )
}
