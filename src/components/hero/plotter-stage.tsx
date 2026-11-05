'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import {
  commitAnchor,
  TIMELINE_OPEN_EVENT,
  type TimelineOpenDetail,
} from '@/constants/ids'
import {
  RULER_END,
  stepIndex,
  YEAR_MAX,
  YEAR_MIN,
  YEAR_STEP,
  type ScrubData,
} from './scrub-data'

const SPAN = RULER_END - YEAR_MIN
const pct = (year: number): number => ((year - YEAR_MIN) / SPAN) * 100
const YEARS = Array.from({ length: SPAN + 1 }, (_, i) => YEAR_MIN + i)
const QUARTERS = [1, 2, 3]
const clampYear = (year: number): number =>
  Math.min(YEAR_MAX, Math.max(YEAR_MIN, year))

interface PlotterStageProps {
  data: ScrubData
  titleBlock: ReactNode
  children: ReactNode
}

export function PlotterStage({ data, titleBlock, children }: PlotterStageProps) {
  const [year, setYear] = useState(2025.4)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const [announce, setAnnounce] = useState('')
  const stageRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)
  const vRef = useRef<HTMLDivElement>(null)
  const hRef = useRef<HTMLDivElement>(null)
  const yRef = useRef<HTMLSpanElement>(null)

  const active = hovering || focused
  const entryIndex = data.steps[stepIndex(year)] ?? -1
  const entry = entryIndex >= 0 ? data.entries[entryIndex] : undefined
  const whole = Math.floor(year)
  const valueText = `${whole}: ${entry ? entry.org : 'before the first entry'}`

  const place = useCallback((raw: number) => {
    if (vRef.current) vRef.current.style.left = `${pct(raw)}%`
  }, [])

  useEffect(() => place(year), [place, year])

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => setAnnounce(valueText), 500)
    return () => window.clearTimeout(timer)
  }, [active, valueText])

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const plot = plotRef.current?.getBoundingClientRect()
    const stage = stageRef.current?.getBoundingClientRect()
    if (!plot || !stage) return
    setHovering(true)
    const y = Math.max(0, event.clientY - stage.top)
    if (hRef.current) hRef.current.style.top = `${y}px`
    if (yRef.current) yRef.current.textContent = y.toFixed(0)
    if (event.clientX < plot.left || event.clientX > plot.right) return
    const raw = clampYear(YEAR_MIN + ((event.clientX - plot.left) / plot.width) * SPAN)
    place(raw)
    setYear(Math.round(raw / YEAR_STEP) * YEAR_STEP)
  }

  const openInLog = () => {
    if (!entry) return
    window.dispatchEvent(
      new CustomEvent<TimelineOpenDetail>(TIMELINE_OPEN_EVENT, {
        detail: { id: entry.id },
      })
    )
    requestAnimationFrame(() => {
      window.location.hash = commitAnchor(entry.id)
    })
  }

  return (
    <div
      ref={stageRef}
      className="relative overflow-x-clip"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setHovering(false)}
    >
      <div
        aria-hidden="true"
        className="ruler-left pointer-events-none absolute inset-y-0 left-0 hidden w-6 border-r border-bp-line md:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-10 border-b border-bp-line bg-bp-surface/70"
      />
      <div
        ref={plotRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 sm:w-[calc(100%-4rem)]"
      >
        {YEARS.map((y) => (
          <div key={y}>
            <span
              className="absolute top-[22px] h-[18px] w-px bg-bp-muted"
              style={{ left: `${pct(y)}%` }}
            />
            {y < RULER_END &&
              QUARTERS.map((q) => (
                <span
                  key={q}
                  className="absolute top-[33px] h-[7px] w-px bg-bp-line"
                  style={{ left: `${pct(y + q / 4)}%` }}
                />
              ))}
            {y < RULER_END && (
              <span
                className={`absolute top-1 pl-1 font-mono text-[11px] leading-4 text-bp-muted ${y % 2 ? 'max-sm:hidden' : ''}`}
                style={{ left: `${pct(y)}%` }}
              >
                {y}
              </span>
            )}
          </div>
        ))}
        <div
          ref={vRef}
          className={`absolute bottom-0 top-10 w-px border-l border-dashed border-bp-accent transition-opacity duration-150 motion-reduce:transition-none ${active ? 'opacity-70' : 'opacity-0'}`}
        />
      </div>
      <div
        ref={hRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-px border-t border-dashed border-bp-accent transition-opacity duration-150 motion-reduce:transition-none md:left-6 ${active ? 'opacity-45' : 'opacity-0'}`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 right-4 z-20 font-mono text-[11px] text-bp-accent sm:right-8"
      >
        X {year.toFixed(1)} · Y <span ref={yRef}>0</span>
      </span>

      <div className="relative z-10 mx-auto box-content max-w-6xl px-4 pb-10 pt-12 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
          <div className="grid gap-2">
            <label
              htmlFor="hero-year"
              className="font-mono text-[11px] uppercase tracking-wider text-bp-muted"
            >
              Scrub years
            </label>
            <span id="hero-year-hint" className="sr-only">
              Press Enter to open this entry in the log.
            </span>
            <input
              id="hero-year"
              type="range"
              min={YEAR_MIN}
              max={YEAR_MAX}
              step={YEAR_STEP}
              value={year}
              aria-valuetext={valueText}
              onChange={(event) => setYear(Number(event.target.value))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openInLog()
              }}
              aria-describedby="hero-year-hint"
              className="h-6 w-full cursor-pointer accent-[var(--bp-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent"
            />
          </div>

          {children}

          <div className="grid min-h-[12rem] min-w-0 sm:min-h-[9rem]">
            <div
              className={`[grid-area:1/1] ${active ? 'invisible' : ''}`}
            >
              {titleBlock}
            </div>
            <button
              type="button"
              onClick={openInLog}
              tabIndex={-1}
              className={`grid content-start gap-2 border border-bp-line bg-bp-surface p-4 text-left [grid-area:1/1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent ${active ? '' : 'invisible'}`}
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-bp-muted">
                Readout
              </span>
              <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-4xl font-bold leading-none text-bp-ink">
                  {whole}
                </span>
                {entry && (
                  <span className="text-base font-semibold text-bp-ink">
                    {entry.org}
                    <span className="font-mono text-xs font-normal text-bp-muted">
                      {' '}
                      · {entry.title}
                    </span>
                  </span>
                )}
              </span>
              <span className="max-w-[60ch] text-sm text-bp-muted">
                {entry ? entry.plain : 'Before the first entry in the log.'}
              </span>
              {entry && (
                <span className="font-mono text-xs text-bp-accent">
                  Open in the log
                </span>
              )}
            </button>
          </div>
        </div>
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>
      </div>
    </div>
  )
}
