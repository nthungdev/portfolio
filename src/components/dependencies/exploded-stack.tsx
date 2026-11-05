'use client'

import { useEffect, useRef, useState } from 'react'
import type { SkillLayer } from '@/content/skills'

const COLORS: Record<SkillLayer['id'], string> = {
  infra: 'text-lane-edu',
  backend: 'text-lane-proj',
  web: 'text-lane-work',
  mobile: 'text-lane-com',
}

const BORDERS: Record<SkillLayer['id'], string> = {
  infra: 'border-lane-edu',
  backend: 'border-lane-proj',
  web: 'border-lane-work',
  mobile: 'border-lane-com',
}

const BASE_Y = 262
const STACKED_GAP = 16
const EXPLODED_GAP = 62
const LIFT = 12

export default function ExplodedStack({ layers }: { layers: SkillLayer[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  // Rest state is fully exploded so no-JS and reduced-motion users see everything.
  const [exploded, setExploded] = useState(true)
  const [active, setActive] = useState<SkillLayer['id'] | null>(null)
  const [pinned, setPinned] = useState<SkillLayer['id'] | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setExploded(false)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setExploded(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const gap = exploded ? EXPLODED_GAP : STACKED_GAP
  const lifted = active ?? pinned

  return (
    <div
      ref={rootRef}
      className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      <svg
        viewBox="0 0 360 340"
        aria-hidden="true"
        focusable="false"
        className="mx-auto h-auto w-full max-w-[280px] md:max-w-[420px]"
      >
        <line
          x1="180"
          x2="180"
          y1={BASE_Y - (layers.length - 1) * gap}
          y2={BASE_Y}
          stroke="var(--bp-line)"
          strokeDasharray="3 5"
          className={`transition-opacity duration-[240ms] motion-reduce:transition-none ${exploded ? 'opacity-100' : 'opacity-0'}`}
        />
        {layers.map((layer, i) => {
          const dy = BASE_Y - i * gap - (lifted === layer.id ? LIFT : 0)
          const dim = lifted !== null && lifted !== layer.id
          return (
            <g
              key={layer.id}
              className={`${COLORS[layer.id]} transition-[transform,opacity] duration-[240ms] motion-reduce:transition-none ${dim ? 'opacity-60' : ''}`}
              style={{ transform: `translateY(${dy}px)` }}
              onMouseEnter={() => setActive(layer.id)}
              onMouseLeave={() => setActive(null)}
            >
              <path
                d="M60 0 L180 60 L180 74 L60 14 Z"
                fill="currentColor"
                fillOpacity="0.35"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M180 60 L300 0 L300 14 L180 74 Z"
                fill="currentColor"
                fillOpacity="0.22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M180 -60 L300 0 L180 60 L60 0 Z"
                fill="var(--bp-surface)"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M180 -60 L300 0 L180 60 L60 0 Z"
                fill="currentColor"
                fillOpacity="0.14"
              />
            </g>
          )
        })}
      </svg>

      <ul className="grid gap-4">
        {[...layers].reverse().map((layer) => (
          <li
            key={layer.id}
            className={`rounded border border-bp-line border-l-4 bg-bp-surface p-4 transition-colors duration-150 ${BORDERS[layer.id]} ${lifted === layer.id ? 'bg-bp-bg' : ''}`}
            onMouseEnter={() => setActive(layer.id)}
            onMouseLeave={() => setActive(null)}
          >
            <h3 className="font-display text-lg font-bold uppercase tracking-wide">
              <button
                type="button"
                aria-pressed={pinned === layer.id}
                onClick={() => setPinned(pinned === layer.id ? null : layer.id)}
                onFocus={() => setActive(layer.id)}
                onBlur={() => setActive(null)}
                className="rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent"
              >
                {layer.label}
              </button>
            </h3>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-bp-muted">
              {layer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
