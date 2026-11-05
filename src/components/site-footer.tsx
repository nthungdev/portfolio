import about from '@/content/about'

export default function SiteFooter() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA || 'dev'
  // Only a real 40-char commit id may become part of the GitHub URL.
  const rawFull = process.env.NEXT_PUBLIC_BUILD_SHA_FULL ?? ''
  const fullSha = /^[0-9a-f]{40}$/.test(rawFull) ? rawFull : null
  const date = process.env.NEXT_PUBLIC_BUILD_DATE

  return (
    <footer className="border-t border-bp-line px-4 py-8 sm:px-8 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {about.socialLinks.map(({ name, url, Icon }) => (
            <li key={name}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded font-mono text-sm text-bp-muted transition-colors duration-150 hover:text-bp-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent"
              >
                <Icon aria-hidden="true" />
                {name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs text-bp-muted">
          Built by {about.name}
          {' · '}
          build{' '}
          {!fullSha ? (
            sha
          ) : (
            <a
              href={`https://github.com/nthungdev/portfolio/commit/${fullSha}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Build commit ${sha} on GitHub`}
              className="rounded underline decoration-bp-line underline-offset-2 hover:text-bp-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent"
            >
              {sha}
            </a>
          )}
          {date ? ` · ${date}` : ''}
        </p>
      </div>
    </footer>
  )
}
