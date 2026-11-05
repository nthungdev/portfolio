import type { SkillLayer } from '@/content/skills'

const ZONE: Record<SkillLayer['id'], string> = {
  mobile: 'var(--lane-com)',
  web: 'var(--lane-work)',
  backend: 'var(--lane-proj)',
  infra: 'var(--lane-edu)',
}

export default function Keyboard({ layers }: { layers: SkillLayer[] }) {
  const rows = [...layers].reverse()
  return (
    <ul className="grid gap-3 border border-bp-line bg-bp-surface p-4 sm:p-6">
      {rows.map((layer) => (
        <li
          key={layer.id}
          style={{ '--zc': ZONE[layer.id] } as React.CSSProperties}
          className="grid min-w-0 grid-cols-1 items-start gap-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3"
        >
          <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-[color:var(--zc)] sm:pt-2">
            {layer.label}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {layer.items.map((item) => (
              <li
                key={item}
                className="min-w-11 cursor-default whitespace-nowrap rounded-[4px] border border-b-4 border-bp-line border-b-[color-mix(in_srgb,var(--zc)_55%,var(--bp-line))] bg-bp-surface px-3 pb-[5px] pt-[7px] text-center font-mono text-[12.5px] font-semibold text-bp-ink transition-[transform,border-bottom-width] duration-75 hover:translate-y-0.5 hover:border-b-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:border-b-4"
              >
                {item}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
