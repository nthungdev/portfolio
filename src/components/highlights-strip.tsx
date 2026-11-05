import IDS from '@/constants/ids'
import highlights from '@/content/highlights'

const COLORS = [
  'var(--lane-work)',
  'var(--lane-work)',
  'var(--lane-proj)',
  'var(--lane-com)',
] as const

export function HighlightsStrip() {
  return (
    <section
      id={IDS.highlights}
      aria-label="Highlights"
      className="scroll-mt-16 px-4 py-8 md:px-6 md:py-12"
    >
      <ul className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-px border border-bp-line bg-bp-line lg:grid-cols-4">
        {highlights.map((item, i) => (
          <li key={item.value} className="min-w-0 bg-bp-surface p-4 md:p-6">
            <strong
              className="block break-words font-display text-3xl font-bold leading-none md:text-5xl"
              style={{ color: COLORS[i % COLORS.length] }}
            >
              {item.value}
            </strong>
            <p className="mt-2 text-sm text-bp-ink md:text-base">{item.label}</p>
            <p className="mt-1 font-mono text-xs text-bp-muted">{item.source}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
