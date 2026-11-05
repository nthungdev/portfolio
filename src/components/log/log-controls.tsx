'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { commitAnchor, TIMELINE_OPEN_EVENT } from '@/constants/ids'
import type { Lane } from '@/lib/timeline/types'
import { FOCUS_RING, LANES, LANE_COLOR, LANE_LABEL } from './lanes'

function isLane(value: string | undefined): value is Lane {
  return LANES.some((lane) => lane === value)
}

function setOpen(item: HTMLElement, open: boolean): void {
  item.dataset.open = String(open)
  item.querySelector('button[data-row]')?.setAttribute('aria-expanded', String(open))
}

export function LogControls({ children }: { children: ReactNode }) {
  const [off, setOff] = useState<ReadonlySet<Lane>>(() => new Set())
  const bodyRef = useRef<HTMLDivElement>(null)

  const reveal = useCallback((id: string) => {
    const item = document.getElementById(commitAnchor(id))
    if (!item) return
    const lane = item.dataset.lane
    if (isLane(lane)) {
      setOff((prev) => {
        if (!prev.has(lane)) return prev
        const next = new Set(prev)
        next.delete(lane)
        return next
      })
    }
    item.closest('details')?.setAttribute('open', '')
    setOpen(item, true)
    // Wait two frames so a hidden view has been revealed before measuring.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        item.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
        item.querySelector<HTMLElement>('button[data-row]')?.focus({ preventScroll: true })
      })
    )
  }, [])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest('button[data-row]')
      const item = button?.closest<HTMLElement>('li[data-open]')
      if (item) setOpen(item, item.dataset.open !== 'true')
    }
    // Trace one branch: mark its graph pieces and let CSS dim the rest.
    const focus = (id: string | undefined) => {
      if (body.dataset.graphFocus === id) return
      body.querySelectorAll('[data-on]').forEach((el) => el.removeAttribute('data-on'))
      if (!id) {
        delete body.dataset.graphFocus
        return
      }
      body.dataset.graphFocus = id
      body
        .querySelectorAll(`[data-b="${CSS.escape(id)}"]`)
        .forEach((el) => el.setAttribute('data-on', ''))
    }
    const onEnter = (event: Event) => {
      if (!(event.target instanceof Element)) return
      focus(event.target.closest<HTMLElement>('li[data-branch]')?.dataset.branch)
    }
    const onLeave = () => focus(undefined)
    body.addEventListener('click', onClick)
    body.addEventListener('mouseover', onEnter)
    body.addEventListener('focusin', onEnter)
    body.addEventListener('mouseleave', onLeave)
    body.addEventListener('focusout', onLeave)
    return () => {
      body.removeEventListener('click', onClick)
      body.removeEventListener('mouseover', onEnter)
      body.removeEventListener('focusin', onEnter)
      body.removeEventListener('mouseleave', onLeave)
      body.removeEventListener('focusout', onLeave)
    }
  }, [])

  useEffect(() => {
    const onOpen = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail?.id === 'string') {
        reveal(event.detail.id)
      }
    }
    const onHash = () => {
      const match = /^#c-(.+)$/.exec(window.location.hash)
      if (match) reveal(match[1])
    }
    window.addEventListener(TIMELINE_OPEN_EVENT, onOpen)
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => {
      window.removeEventListener(TIMELINE_OPEN_EVENT, onOpen)
      window.removeEventListener('hashchange', onHash)
    }
  }, [reveal])

  const toggle = (lane: Lane) =>
    setOff((prev) => {
      const next = new Set(prev)
      if (next.has(lane)) next.delete(lane)
      else next.add(lane)
      return next
    })

  const flag = (lane: Lane) => (off.has(lane) ? '' : undefined)

  return (
    <div
      className="group/log"
      data-off-work={flag('work')}
      data-off-education={flag('education')}
      data-off-project={flag('project')}
    >
      <div role="group" aria-label="Show lanes" className="mb-4 flex flex-wrap gap-2">
        {LANES.map((lane) => {
          const on = !off.has(lane)
          return (
            <button
              key={lane}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(lane)}
              className={`inline-flex items-center gap-2 rounded border px-2.5 py-1 font-mono text-xs transition-colors duration-150 motion-reduce:transition-none ${FOCUS_RING} ${
                on
                  ? 'border-bp-accent bg-bp-surface text-bp-ink'
                  : 'border-bp-line text-bp-muted'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full border"
                style={{
                  borderColor: LANE_COLOR[lane],
                  backgroundColor: on ? LANE_COLOR[lane] : 'transparent',
                }}
              />
              {LANE_LABEL[lane]}
            </button>
          )
        })}
      </div>
      <div ref={bodyRef}>{children}</div>
    </div>
  )
}
