'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { FOCUS_RING, LANE_COLOR, LANE_LABEL } from '@/components/log/lanes'
import { formatMonth, formatRange, parseYearMonth } from '@/lib/timeline/format'
import type { TimelineEntry } from '@/lib/timeline/types'
import './time-machine.css'

/** Rail occupies 4%..92% of its height; the bottom gap holds the "Now" label. */
const Y_TOP = 4
const Y_BOTTOM = 92
const SNAP_IDLE_MS = 140
const VISIBLE_BEHIND = 8

const isLab = (entry: TimelineEntry): boolean => entry.tag === 'lab'
const laneLabel = (entry: TimelineEntry): string =>
  isLab(entry) ? 'Tinkering now' : LANE_LABEL[entry.lane]
const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value))

interface DragState {
  startY: number
  startTarget: number
  moved: boolean
  index: number | null
}

interface TipState {
  index: number
  top: number
}

export function TimeMachine({ entries }: { entries: TimelineEntry[] }) {
  const max = Math.max(0, entries.length - 1)
  const [active, setActive] = useState(0)
  const [tip, setTip] = useState<TipState | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const winRefs = useRef<(HTMLElement | null)[]>([])
  const posRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const snapRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const shownRef = useRef(0)
  const dragRef = useRef<DragState | null>(null)
  const railDownRef = useRef(false)

  const railY = useCallback(
    (index: number): number => Y_BOTTOM - (max === 0 ? 0 : index / max) * (Y_BOTTOM - Y_TOP),
    [max]
  )

  const layout = useCallback(() => {
    const pos = posRef.current
    winRefs.current.forEach((win, i) => {
      if (!win) return
      const d = i - pos
      if (d < -1.2 || d > VISIBLE_BEHIND) {
        win.style.visibility = 'hidden'
        return
      }
      win.style.visibility = 'visible'
      let y: number
      let z: number
      let opacity: number
      if (d >= 0) {
        z = -d * 150
        y = -d * 46
        opacity = d > 6 ? Math.max(0, 7 - d) : 1
      } else {
        z = -d * 420
        y = -d * 30
        opacity = Math.max(0, 1 + d * 1.4)
      }
      win.style.transform = `translate3d(0,${y.toFixed(1)}px,${z.toFixed(1)}px)`
      win.style.opacity = opacity.toFixed(3)
      win.style.setProperty('--dim', Math.min(0.85, Math.max(0, d) * 0.14).toFixed(3))
      win.style.zIndex = String(100 - Math.round(d * 10))
      win.style.pointerEvents = d < -0.3 ? 'none' : 'auto'
      if (Math.abs(d) < 0.5) win.setAttribute('data-front', '')
      else win.removeAttribute('data-front')
    })
    const current = Math.round(pos)
    if (current !== shownRef.current) {
      shownRef.current = current
      setActive(current)
    }
  }, [])

  const frame = useCallback(
    (time: number) => {
      const dt = lastRef.current ? Math.min(64, time - lastRef.current) : 16
      lastRef.current = time
      const k = 1 - Math.pow(0.86, dt / 16.7)
      posRef.current += (targetRef.current - posRef.current) * k
      if (Math.abs(targetRef.current - posRef.current) < 0.0015) {
        posRef.current = targetRef.current
        rafRef.current = 0
        lastRef.current = 0
        layout()
        return
      }
      layout()
      rafRef.current = requestAnimationFrame(frame)
    },
    [layout]
  )

  const go = useCallback(
    (to: number, snap = false) => {
      const next = clamp(to, 0, max)
      targetRef.current = snap ? Math.round(next) : next
      if (reducedMotion()) {
        posRef.current = targetRef.current
        layout()
        return
      }
      if (!rafRef.current) rafRef.current = requestAnimationFrame(frame)
    },
    [frame, layout, max]
  )

  useEffect(() => {
    layout()
    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(snapRef.current)
    }
  }, [layout])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onWheel = (event: WheelEvent) => {
      const delta = event.deltaMode === 1 ? event.deltaY * 30 : event.deltaY
      // Scrolling up travels back in time; let the page scroll once past either end.
      if ((targetRef.current >= max && delta < 0) || (targetRef.current <= 0 && delta > 0)) return
      event.preventDefault()
      go(targetRef.current - delta / 220)
      clearTimeout(snapRef.current)
      snapRef.current = setTimeout(() => go(targetRef.current, true), SNAP_IDLE_MS)
    }
    root.addEventListener('wheel', onWheel, { passive: false })
    return () => root.removeEventListener('wheel', onWheel)
  }, [go, max])

  const step = (delta: number) => go(Math.round(targetRef.current) + delta, true)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'PageUp':
        step(1)
        break
      case 'ArrowDown':
      case 'PageDown':
        step(-1)
        break
      case 'Home':
        go(0, true)
        break
      case 'End':
        go(max, true)
        break
      default:
        return
    }
    event.preventDefault()
  }

  const onSpaceDown = (event: PointerEvent<HTMLDivElement>) => {
    const win = (event.target as HTMLElement).closest<HTMLElement>('[data-i]')
    dragRef.current = {
      startY: event.clientY,
      startTarget: targetRef.current,
      moved: false,
      index: win ? Number(win.dataset.i) : null,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onSpaceMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const dy = event.clientY - drag.startY
    if (Math.abs(dy) > 4) drag.moved = true
    go(drag.startTarget + dy / 90)
  }

  const onSpaceUp = () => {
    const drag = dragRef.current
    dragRef.current = null
    if (drag && !drag.moved && drag.index !== null) go(drag.index, true)
    else go(targetRef.current, true)
  }

  const railIndex = (clientY: number): number => {
    const rect = railRef.current?.getBoundingClientRect()
    if (!rect || rect.height === 0) return 0
    const percent = ((clientY - rect.top) / rect.height) * 100
    return clamp(Math.round(((Y_BOTTOM - percent) / (Y_BOTTOM - Y_TOP)) * max), 0, max)
  }

  const showTip = (index: number) => {
    const rail = railRef.current?.getBoundingClientRect()
    const root = rootRef.current?.getBoundingClientRect()
    if (!rail || !root) return
    const top = rail.top - root.top + (railY(index) / 100) * rail.height
    setTip({ index, top: clamp(top, 70, root.height - 70) })
  }

  const onRailMove = (event: PointerEvent<HTMLDivElement>) => {
    const index = railIndex(event.clientY)
    showTip(index)
    if (railDownRef.current) go(index, true)
  }

  const onRailDown = (event: PointerEvent<HTMLDivElement>) => {
    railDownRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    go(railIndex(event.clientY), true)
  }

  const onRailUp = () => {
    railDownRef.current = false
    setTip(null)
  }

  if (entries.length === 0) return null

  const current = entries[active]
  const firstYear = Math.min(
    ...entries.filter((e) => !isLab(e)).map((e) => parseYearMonth(e.start).year)
  )
  const seenYears = new Set<number>()
  let lastLabelY = -100
  const tipEntry = tip ? entries[tip.index] : null
  const tipImage = tipEntry?.featured?.images[0]

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="time machine"
      aria-label="Career time machine. Use the up and down arrow keys to travel back and forward in time."
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={`tm ${FOCUS_RING}`}
    >
      <div
        className="tm-space"
        onPointerDown={onSpaceDown}
        onPointerMove={onSpaceMove}
        onPointerUp={onSpaceUp}
        onPointerCancel={onSpaceUp}
      >
        {entries.map((entry, i) => {
          const image = entry.featured?.images[0]
          return (
            <article
              key={entry.id}
              ref={(el) => {
                winRefs.current[i] = el
              }}
              data-i={i}
              aria-hidden={i !== active}
              className="tm-win"
              style={{ '--c': LANE_COLOR[entry.lane] } as CSSProperties}
            >
              <div className="tm-bar">
                <i />
                <i />
                <i />
                <span>
                  {entry.org} — {entry.title}
                </span>
              </div>
              <div className="tm-body">
                <div>
                  <span className="tm-lane">{laneLabel(entry)}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.plain}</p>
                  <div className="tm-meta">
                    {entry.org} · {formatRange(entry)}
                  </div>
                </div>
                {image && (
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="170px"
                    draggable={false}
                    className="tm-shot"
                  />
                )}
              </div>
            </article>
          )
        })}
        <div className="tm-date" aria-hidden="true">
          <b>{isLab(current) || current.end === null ? 'Today' : formatMonth(current.start)}</b>
          <span>
            {active + 1} of {entries.length} · {current.title}
          </span>
        </div>
      </div>

      <div className="tm-arrows">
        <button type="button" aria-label="Go back in time" className={FOCUS_RING} onClick={() => step(1)}>
          <span aria-hidden="true">↑</span>
        </button>
        <button type="button" aria-label="Go forward in time" className={FOCUS_RING} onClick={() => step(-1)}>
          <span aria-hidden="true">↓</span>
        </button>
      </div>

      <div
        ref={railRef}
        className="tm-rail"
        aria-hidden="true"
        onPointerMove={onRailMove}
        onPointerDown={onRailDown}
        onPointerUp={onRailUp}
        onPointerCancel={onRailUp}
        onPointerLeave={() => {
          if (!railDownRef.current) setTip(null)
        }}
      >
        {entries.map((entry, i) => {
          const year = isLab(entry) ? null : parseYearMonth(entry.start).year
          // Busy recent years sit close together on the rail; skip labels that would collide.
          const label =
            year !== null &&
            !seenYears.has(year) &&
            (year % 2 === 0 || year === firstYear) &&
            Math.abs(railY(i) - lastLabelY) >= 6
          if (year !== null) seenYears.add(year)
          if (label) lastLabelY = railY(i)
          return (
            <span key={entry.id}>
              <span
                className="tm-tk"
                style={{ top: `${railY(i)}%` }}
                data-on={i === active ? '' : undefined}
                data-near={Math.abs(i - active) === 1 ? '' : undefined}
              />
              {label && (
                <span className="tm-yl" style={{ top: `${railY(i)}%` }}>
                  {year}
                </span>
              )}
            </span>
          )
        })}
        <span className="tm-now">Now</span>
      </div>

      <div
        className="tm-tip"
        aria-hidden="true"
        data-show={tipEntry ? '' : undefined}
        style={{ top: tip?.top, '--c': tipEntry ? LANE_COLOR[tipEntry.lane] : undefined } as CSSProperties}
      >
        {tipEntry && (
          <>
            {tipImage && (
              <Image
                src={tipImage.src}
                alt=""
                width={tipImage.width}
                height={tipImage.height}
                sizes="230px"
              />
            )}
            <span className="tm-lane">{laneLabel(tipEntry)}</span>
            <b>{tipEntry.title}</b>
            <span>
              {tipEntry.org} · {isLab(tipEntry) ? 'now' : formatMonth(tipEntry.start)}
            </span>
          </>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {current.title}, {current.org}, {formatRange(current)}. {active + 1} of {entries.length}.
      </p>
      <ol className="sr-only">
        {entries.map((entry) => (
          <li key={entry.id}>
            {entry.title}, {entry.org}, {formatRange(entry)}. {entry.plain}
          </li>
        ))}
      </ol>
    </div>
  )
}
