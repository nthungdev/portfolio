import IDS from '@/constants/ids'
import skills from '@/content/skills'
import ExplodedStack from './exploded-stack'

export default function Dependencies() {
  return (
    <section
      id={IDS.dependencies}
      aria-labelledby="dependencies-heading"
      className="scroll-mt-16 border-t border-bp-line px-4 py-16 sm:px-8 [background-image:linear-gradient(var(--bp-grid)_1px,transparent_1px),linear-gradient(90deg,var(--bp-grid)_1px,transparent_1px)] [background-size:24px_24px]"
    >
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="grid gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-bp-muted">
            package.json
          </p>
          <h2
            id="dependencies-heading"
            className="font-display text-3xl font-bold uppercase tracking-wide"
          >
            Dependencies
          </h2>
          <p className="max-w-prose text-bp-muted">
            The layers I build on, from infrastructure up to the screen.
          </p>
        </header>
        <ExplodedStack layers={skills} />
      </div>
    </section>
  )
}
