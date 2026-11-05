'use client'

import { useState } from 'react'
import { FOCUS_RING, LANE_COLOR } from '@/components/log/lanes'
import { formatRange, toYearFraction, yearToPercent } from '@/lib/timeline/format'
import type { Lane, TimelineEntry } from '@/lib/timeline/types'

const MIN_YEAR = 2016
/** Exclusive upper bound: the axis covers all of 2026. */
const MAX_YEAR = 2027
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR }, (_, i) => MIN_YEAR + i)

const GROUPS: readonly { lane: Lane; label: string }[] = [
  { lane: 'work', label: 'Jobs' },
  { lane: 'education', label: 'School' },
  { lane: 'community', label: 'Clubs & teaching' },
  { lane: 'project', label: 'Side projects' },
]

const GRID_BG = {
  backgroundImage:
    'linear-gradient(to right, var(--bp-line) 1px, transparent 1px)',
  backgroundSize: `calc(100% / ${YEARS.length}) 100%`,
} as const

const ROW =
  'grid w-full gap-1 rounded px-1 py-1.5 text-left hover:bg-bp-surface sm:grid-cols-[14rem_1fr] sm:items-center sm:gap-4'

const pct = (value: number): number => yearToPercent(value, MIN_YEAR, MAX_YEAR)

function Track({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-5 border-b border-l border-bp-line"
      style={GRID_BG}
    >
      {children}
    </span>
  )
}

function Bar({ entry }: { entry: TimelineEntry }) {
  const left = pct(toYearFraction(entry.start))
  const color = LANE_COLOR[entry.lane]
  if (entry.end === undefined) {
    return (
      <span
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-bp-bg"
        style={{ left: `${left}%`, borderColor: color }}
      />
    )
  }
  const right = entry.end === null ? 100 : pct(toYearFraction(entry.end) + 1 / 12)
  return (
    <span
      className="absolute top-1 h-3 rounded"
      style={{
        left: `${left}%`,
        width: `${Math.max(right - left, 1.5)}%`,
        backgroundColor: color,
      }}
    />
  )
}

function Axis() {
  return (
    <div className="hidden sm:grid sm:grid-cols-[14rem_1fr] sm:gap-4 sm:px-1" aria-hidden="true">
      <span />
      <span className="flex font-mono text-xs text-bp-muted">
        {YEARS.map((year) => (
          <span key={year} className="flex-1 pl-1">
            {year}
          </span>
        ))}
      </span>
    </div>
  )
}

function Label({ entry }: { entry: TimelineEntry }) {
  return (
    <span className="min-w-0">
      <span className="block font-sans font-semibold text-bp-ink">{entry.title}</span>
      <span className="block text-sm text-bp-muted">{entry.org}</span>
    </span>
  )
}

function EntryRow({ entry }: { entry: TimelineEntry }) {
  const [open, setOpen] = useState(false)
  const panelId = `plain-${entry.id}`
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`${ROW} ${FOCUS_RING}`}
      >
        <Label entry={entry} />
        <Track>
          <Bar entry={entry} />
        </Track>
      </button>
      <p id={panelId} hidden={!open} className="px-1 pb-2 pt-1 text-bp-ink sm:ml-[15rem]">
        <span className="mr-2 font-mono text-xs text-bp-muted">{formatRange(entry)}</span>
        {entry.plain}
      </p>
    </li>
  )
}

function ProjectsRow({ entries }: { entries: TimelineEntry[] }) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="plain-projects"
        onClick={() => setOpen((v) => !v)}
        className={`${ROW} ${FOCUS_RING}`}
      >
        <span className="font-sans font-semibold text-bp-ink">
          {entries.length} projects
          <span className="block text-sm font-normal text-bp-muted">
            {open ? 'Hide the list' : 'Show the list'}
          </span>
        </span>
        <Track>
          {entries.map((entry) => (
            <Bar key={entry.id} entry={{ ...entry, end: undefined }} />
          ))}
        </Track>
      </button>
      <ul id="plain-projects" hidden={!open} className="space-y-2 px-1 pb-2 pt-1 sm:ml-[15rem]">
        {entries.map((entry) => (
          <li key={entry.id}>
            <span className="font-sans font-semibold text-bp-ink">{entry.title}</span>
            <span className="ml-2 font-mono text-xs text-bp-muted">{formatRange(entry)}</span>
            <span className="block text-bp-ink">{entry.plain}</span>
          </li>
        ))}
      </ul>
    </li>
  )
}

export function PlainView({ entries }: { entries: TimelineEntry[] }) {
  return (
    <div>
      <Axis />
      {GROUPS.map(({ lane, label }) => {
        const items = entries
          .filter((e) => e.lane === lane)
          .sort((a, b) => b.start.localeCompare(a.start))
        if (items.length === 0) return null
        return (
          <section key={lane} aria-label={label} className="mt-6 first-of-type:mt-2">
            <h3
              className="mb-1 font-display text-sm font-bold uppercase tracking-wider"
              style={{ color: LANE_COLOR[lane] }}
            >
              {label}
            </h3>
            <ul className="divide-y divide-bp-line/50">
              {lane === 'project' ? (
                <ProjectsRow entries={items} />
              ) : (
                items.map((entry) => <EntryRow key={entry.id} entry={entry} />)
              )}
            </ul>
          </section>
        )
      })}
      <p className="mt-6 text-sm text-bp-muted">
        Select a row for a one-line summary. Bars that overlap are things I did at
        the same time.
      </p>
    </div>
  )
}
