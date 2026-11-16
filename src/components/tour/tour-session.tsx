'use client'

import './tour.css'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
import { copyText } from '@/components/contact/copy-text'
import IDS, {
  CONTACT_PREFILL_EVENT,
  TIMELINE_OPEN_EVENT,
  type ContactPrefillDetail,
  type TimelineOpenDetail,
} from '@/constants/ids'
import about from '@/content/about'
import type { TourGroup } from '@/lib/tour/build-tour'
import { SlideView, slideAnnouncement, type SlideEnv } from './slides'
import { readHintSeen, useReducedMotion, writeHintSeen } from './tour-seen'
import { useTourPlayer } from './use-tour-player'

const OPEN_MS = 480
const CLOSE_MS = 420
const HOLD_MS = 220
const HINT_MS = 2400
const CLOSE_DRAG_PX = 110
const EASE_OPEN = 'cubic-bezier(.2,.8,.2,1)'
const REACTIONS = [
  { emoji: '🔥', label: 'fire' },
  { emoji: '👏', label: 'clap' },
  { emoji: '❤️', label: 'heart' },
]
const INTERACTIVE = 'button, a, input, textarea'

interface Floater {
  id: number
  emoji: string
  left: number
  top: number
  drift: number
  rot: number
  delay: number
}

type CssVars = Record<`--${string}`, string | number>
// CSSProperties has no index signature for custom properties.
const vars = (v: CssVars): CSSProperties => v as CSSProperties

/** Where the frame grows from / shrinks to: a clip around the origin, or a scale toward it when it is off-frame. */
function originKeyframes(
  frame: HTMLElement,
  origin: HTMLElement | null,
  radius: string,
): { from: Keyframe; to: Keyframe } | null {
  if (!origin) return null
  const o = origin.getBoundingClientRect()
  const f = frame.getBoundingClientRect()
  if (o.width === 0 || o.height === 0) return null
  const cx = o.left + o.width / 2
  const cy = o.top + o.height / 2
  const inside = cx > f.left && cx < f.right && cy > f.top && cy < f.bottom
  if (inside) {
    const inset = [o.top - f.top, f.right - o.right, f.bottom - o.bottom, o.left - f.left]
      .map((n) => `${Math.max(0, n)}px`)
      .join(' ')
    return {
      from: { clipPath: `inset(${inset} round 999px)`, opacity: 1 },
      to: { clipPath: `inset(0px 0px 0px 0px round ${radius})`, opacity: 1 },
    }
  }
  const dx = cx - (f.left + f.width / 2)
  const dy = cy - (f.top + f.height / 2)
  return {
    from: { transform: `translate(${dx}px, ${dy}px) scale(.15)`, opacity: 0 },
    to: { transform: 'none', opacity: 1 },
  }
}

function ConfettiBurst({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    canvas.width = canvas.clientWidth * 2
    canvas.height = canvas.clientHeight * 2
    const colors = ['#5ad1ff', '#b8a8ff', '#7ee0a8', '#ffb347', '#ff6bb5']
    const pieces = Array.from({ length: 90 }, (_, i) => ({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 26,
      vy: -Math.random() * 26 - 8,
      size: Math.random() * 6 + 4,
      angle: Math.random() * 6,
      color: colors[i % colors.length],
    }))
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const k = (now - start) / 1600
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of pieces) {
        p.vy += 0.9
        p.x += p.vx
        p.y += p.vy
        p.angle += 0.2
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = Math.max(0, 1 - k)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        ctx.restore()
      }
      if (k < 1) frame = requestAnimationFrame(tick)
      else onDone()
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onDone])

  return <canvas ref={canvasRef} className="tour-confetti" aria-hidden="true" />
}

interface FaceProps {
  position: 'prev' | 'front' | 'next'
  group: TourGroup
  slideIndex: number
  nextGroup?: TourGroup
  env: SlideEnv
}

function Face({ position, group, slideIndex, nextGroup, env }: FaceProps) {
  const slide = group.slides[slideIndex]
  const front = position === 'front'
  const teaser = nextGroup && slideIndex === group.slides.length - 1 ? nextGroup : undefined
  return (
    <div className="tour-face" data-pos={position} aria-hidden={front ? undefined : true} inert={!front}>
      <SlideView key={slide.key} slide={slide} env={env} />
      {teaser && (
        <div
          className="tour-teaser"
          data-above={Boolean(slide.logId)}
          style={vars({ '--dur': `${slide.durationMs}ms` })}
          aria-hidden="true"
        >
          <span className="tour-ring" style={{ width: 30, height: 30 }}>
            <i>{teaser.badge}</i>
          </span>
          Up next: {teaser.name} ›
        </div>
      )}
    </div>
  )
}

interface SessionProps {
  groups: TourGroup[]
  startIndex: number
  originId?: string
  onClosed: () => void
}

export function TourSession({ groups, startIndex, originId, onClosed }: SessionProps) {
  const reduce = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const moveRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const originRef = useRef<HTMLElement | null>(null)
  const closingRef = useRef(false)
  const toastTimer = useRef(0)
  const holdTimer = useRef(0)
  const floatId = useRef(0)
  const gesture = useRef<{
    x: number
    y: number
    axis: 'x' | 'y' | 'none' | null
    angle: number
    dy: number
    held: boolean
  } | null>(null)

  const [opening, setOpening] = useState(true)
  const [closing, setClosing] = useState(false)
  const [hintOn, setHintOn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [toast, setToast] = useState('')
  const [bursts, setBursts] = useState(0)
  const [floaters, setFloaters] = useState<Floater[]>([])

  const celebrate = useCallback(() => setBursts((n) => n + 1), [])
  const clearBurst = useCallback(() => setBursts(0), [])
  const player = useTourPlayer({
    groups,
    startIndex,
    reduce,
    suspended: opening || closing || hintOn || dragging,
    onFinish: celebrate,
  })
  const { group, slide, groupIndex, slideIndex } = player
  const prevGroup = groups[groupIndex - 1]
  const nextGroup = groups[groupIndex + 1]

  const say = (text: string) => {
    setToast(text)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 1900)
  }

  // Scroll lock and focus return mirror the command palette.
  useLayoutEffect(() => {
    originRef.current = originId ? document.getElementById(originId) : null
    const returnFocus = originRef.current ?? (document.activeElement as HTMLElement | null)
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) {
      const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0
      document.body.style.paddingRight = `${current + scrollbar}px`
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      returnFocus?.focus({ preventScroll: true })
    }
  }, [originId])

  useLayoutEffect(() => {
    const frame = frameRef.current
    const move = moveRef.current
    const scrim = scrimRef.current
    if (!frame || !move || !scrim) return
    frame.focus({ preventScroll: true })
    const radius = getComputedStyle(frame).borderRadius || '0px'
    const keys = reduce ? null : originKeyframes(frame, originRef.current, radius)
    const options = { duration: OPEN_MS, easing: EASE_OPEN }
    scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 150 : OPEN_MS })
    if (!keys) {
      frame.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 }).onfinish = () => setOpening(false)
      return
    }
    move.animate(
      [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }],
      { duration: 420, easing: 'ease-out' },
    )
    frame.animate([keys.from, keys.to], options).onfinish = () => setOpening(false)
  }, [reduce])

  useEffect(() => {
    if (opening || readHintSeen()) return
    setHintOn(true)
    const timer = window.setTimeout(() => {
      writeHintSeen()
      setHintOn(false)
    }, HINT_MS)
    return () => window.clearTimeout(timer)
  }, [opening])

  // A removed slide takes keyboard focus with it; keep it inside the dialog.
  useEffect(() => {
    const frame = frameRef.current
    if (frame && !frame.contains(document.activeElement)) frame.focus({ preventScroll: true })
  }, [slide.key])

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current)
      window.clearTimeout(holdTimer.current)
    },
    [],
  )

  const close = (then?: () => void, fromDrag = false) => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    const frame = frameRef.current
    const move = moveRef.current
    const scrim = scrimRef.current
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      flushSync(onClosed)
      then?.()
    }
    if (!frame || !move || !scrim) {
      finish()
      return
    }
    const radius = getComputedStyle(frame).borderRadius || '0px'
    const keys = reduce ? null : originKeyframes(frame, originRef.current, radius)
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: keys ? CLOSE_MS : 150, fill: 'forwards' })
    if (!keys) {
      frame.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }).onfinish = finish
    } else {
      move.animate(
        [
          { transform: fromDrag ? move.style.transform || 'none' : 'none', opacity: 1 },
          { transform: 'scale(.6)', opacity: 0 },
        ],
        { duration: CLOSE_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' },
      )
      frame.animate(
        [{ ...keys.to, opacity: 1 }, { opacity: 1, offset: 0.6 }, { ...keys.from, opacity: 0 }],
        { duration: CLOSE_MS, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' },
      ).onfinish = finish
    }
    window.setTimeout(finish, CLOSE_MS + 200)
  }

  const contactAbout = (subject: string, label?: string) => {
    document.getElementById(IDS.contact)?.scrollIntoView({ block: 'start' })
    window.dispatchEvent(
      new CustomEvent<ContactPrefillDetail>(CONTACT_PREFILL_EVENT, {
        detail: { subject: `Re: ${subject}`.slice(0, 120), label },
      }),
    )
  }

  const env: SlideEnv = {
    active: true,
    paused: player.paused,
    reduce,
    onAnswer: (win, message) => {
      player.markAnswered()
      if (win && !reduce) celebrate()
      if (message) say(message)
    },
    onOpenLog: (id) =>
      close(() =>
        window.dispatchEvent(new CustomEvent<TimelineOpenDetail>(TIMELINE_OPEN_EVENT, { detail: { id } })),
      ),
    onIssue: () => close(() => contactAbout(slide.subject)),
    onCopyEmail: () => {
      void copyText(about.email).then((ok) => say(ok ? 'Email copied' : about.email))
    },
  }
  const sideEnv: SlideEnv = {
    active: false,
    paused: true,
    reduce,
    onAnswer: () => {},
    onOpenLog: () => {},
    onIssue: () => {},
    onCopyEmail: () => {},
  }

  const react = (emoji: string, button: HTMLElement) => {
    const frame = frameRef.current
    if (!frame || reduce) return
    const b = button.getBoundingClientRect()
    const f = frame.getBoundingClientRect()
    const made = [0, 1, 2].map((i) => ({
      id: floatId.current++,
      emoji,
      left: b.left - f.left + (i - 1) * 8,
      top: b.top - f.top,
      drift: (Math.random() - 0.5) * 90,
      rot: (Math.random() - 0.5) * 50,
      delay: i * 0.09,
    }))
    setFloaters((all) => [...all, ...made])
    window.setTimeout(() => setFloaters((all) => all.filter((x) => !made.includes(x))), 1600)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as Element | null
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (event.shiftKey) player.turn(1)
        else player.next()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (event.shiftKey) player.turn(-1)
        else player.prev()
      } else if (event.key === ' ' && !target?.closest(INTERACTIVE)) {
        event.preventDefault()
        player.togglePause()
      } else if (event.key === 'Tab') {
        const frame = frameRef.current
        if (!frame) return
        const items = Array.from(
          frame.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
        ).filter((el) => !el.closest('[inert]'))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (event.shiftKey && (active === first || active === frame)) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        } else if (!frame.contains(active)) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest(INTERACTIVE) || player.turning || closingRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    gesture.current = { x: event.clientX, y: event.clientY, axis: null, angle: 0, dy: 0, held: false }
    event.currentTarget.setPointerCapture(event.pointerId)
    window.clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(() => {
      if (!gesture.current) return
      gesture.current.held = true
      player.setHolding(true)
    }, HOLD_MS)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    const move = moveRef.current
    if (!g || !move) return
    const dx = event.clientX - g.x
    const dy = event.clientY - g.y
    if (!g.axis && Math.hypot(dx, dy) > 8) {
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : dy > 0 ? 'y' : 'none'
      window.clearTimeout(holdTimer.current)
      if (hintOn) setHintOn(false)
      if (g.axis !== 'none') setDragging(true)
    }
    if (g.axis === 'x') {
      const width = event.currentTarget.clientWidth
      g.angle = player.dragCube((dx / width) * 90)
    } else if (g.axis === 'y') {
      g.dy = Math.max(0, dy)
      move.style.transform = `translateY(${g.dy}px) scale(${Math.max(0.75, 1 - g.dy / 1400)})`
      move.style.opacity = String(Math.max(0.4, 1 - g.dy / 700))
    }
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    const move = moveRef.current
    gesture.current = null
    window.clearTimeout(holdTimer.current)
    if (!g || !move) return
    player.setHolding(false)
    setDragging(false)
    if (g.axis === 'x') {
      player.releaseCube(g.angle)
      return
    }
    if (g.axis === 'y') {
      if (g.dy > CLOSE_DRAG_PX) {
        close(undefined, true)
      } else {
        move.animate(
          [{ transform: move.style.transform, opacity: move.style.opacity }, { transform: 'none', opacity: 1 }],
          { duration: 260, easing: 'ease-out' },
        )
        move.style.transform = ''
        move.style.opacity = ''
      }
      return
    }
    if (g.held || g.axis === 'none') return
    const rect = event.currentTarget.getBoundingClientRect()
    if (event.clientX - rect.left < rect.width * 0.3) player.prev()
    else player.next()
  }

  const onPointerCancel = () => {
    gesture.current = null
    window.clearTimeout(holdTimer.current)
    player.setHolding(false)
    setDragging(false)
    player.releaseCube(0)
  }

  const waitsForAnswer = (slide.kind === 'quiz' || slide.kind === 'poll') && !player.answered
  const running = !reduce && !waitsForAnswer
  const subject = slide.subject

  return (
    <div className="tour-root">
      <div ref={scrimRef} className="tour-scrim" onMouseDown={() => close()} aria-hidden="true" />
      {prevGroup && (
        <div className="tour-side" data-side="prev">
          <div className="tour-side-inner" aria-hidden="true" inert>
            <SlideView
              key={prevGroup.slides[player.slideIndexes[groupIndex - 1]].key}
              slide={prevGroup.slides[player.slideIndexes[groupIndex - 1]]}
              env={sideEnv}
            />
          </div>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Previous topic: ${prevGroup.name}`}
            onClick={() => player.turn(-1)}
          />
        </div>
      )}
      {nextGroup && (
        <div className="tour-side" data-side="next">
          <div className="tour-side-inner" aria-hidden="true" inert>
            <SlideView
              key={nextGroup.slides[player.slideIndexes[groupIndex + 1]].key}
              slide={nextGroup.slides[player.slideIndexes[groupIndex + 1]]}
              env={sideEnv}
            />
          </div>
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Next topic: ${nextGroup.name}`}
            onClick={() => player.turn(1)}
          />
        </div>
      )}
      <div
        ref={frameRef}
        className="tour-frame"
        role="dialog"
        aria-modal="true"
        aria-label={`Tour of ${about.name}'s portfolio`}
        tabIndex={-1}
        data-paused={player.paused}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div ref={moveRef} className="tour-move">
          <div className="tour-cube-wrap">
            <div ref={player.cubeRef} className="tour-cube" style={vars({ '--h': `${player.half}px` })}>
              {!reduce && prevGroup && (
                <Face
                  position="prev"
                  group={prevGroup}
                  slideIndex={player.slideIndexes[groupIndex - 1]}
                  nextGroup={group}
                  env={sideEnv}
                />
              )}
              <Face
                position="front"
                group={group}
                slideIndex={slideIndex}
                nextGroup={nextGroup}
                env={env}
              />
              {!reduce && nextGroup && (
                <Face
                  position="next"
                  group={nextGroup}
                  slideIndex={player.slideIndexes[groupIndex + 1]}
                  nextGroup={groups[groupIndex + 2]}
                  env={sideEnv}
                />
              )}
            </div>
          </div>

          <div className="tour-top">
            <div className="tour-bars" aria-hidden="true">
              {group.slides.map((s, j) => (
                <i key={s.key} data-state={j < slideIndex ? 'done' : j === slideIndex ? 'cur' : 'next'}>
                  <b
                    className={j === slideIndex && running ? 'tour-run' : undefined}
                    style={vars({ '--dur': `${s.durationMs}ms` })}
                    onAnimationEnd={j === slideIndex ? player.next : undefined}
                  />
                </i>
              ))}
            </div>
            <div className="tour-who">
              <span className="tour-ring" style={{ width: 30, height: 30 }}>
                <Image
                  src="/me.jpg"
                  alt=""
                  width={26}
                  height={26}
                  className="h-full w-full rounded-full border-2 border-bp-surface object-cover"
                />
              </span>
              <span className="tour-grp">
                <b>{group.name}</b> · {slideIndex + 1} of {group.slides.length}
              </span>
              <button type="button" className="tour-pp" onClick={player.togglePause}>
                {player.manualPaused ? 'Play' : 'Pause'}
              </button>
              <button type="button" className="tour-x" onClick={() => close()} aria-label="Close the tour">
                ×
              </button>
            </div>
          </div>

          <div className="tour-hint" data-on={hintOn} aria-hidden="true">
            <ul>
              <li>
                <i>👆</i>Tap for the next one
              </li>
              <li>
                <i>✋</i>Hold to pause
              </li>
              <li>
                <i>↔</i>Swipe for other topics
              </li>
              <li>
                <i>↓</i>Swipe down to close
              </li>
            </ul>
          </div>

          <div className="tour-gpills">
            {prevGroup ? (
              <button type="button" onClick={() => player.turn(-1)} aria-label={`Previous topic: ${prevGroup.name}`}>
                ‹ {prevGroup.name}
              </button>
            ) : (
              <span />
            )}
            {nextGroup && (
              <button type="button" onClick={() => player.turn(1)} aria-label={`Next topic: ${nextGroup.name}`}>
                {nextGroup.name} ›
              </button>
            )}
          </div>

          <div className="tour-reply">
            <button
              type="button"
              className="tour-msg"
              onClick={() => close(() => contactAbout(subject, 'job opportunity'))}
            >
              Send a message about {subject}…
            </button>
            {REACTIONS.map(({ emoji, label }) => (
              <button
                key={label}
                type="button"
                className="tour-re"
                aria-label={`React with ${label}`}
                onClick={(event) => react(emoji, event.currentTarget)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {floaters.map((f) => (
            <span
              key={f.id}
              className="tour-float"
              aria-hidden="true"
              style={{
                left: f.left,
                top: f.top,
                animationDelay: `${f.delay}s`,
                ...vars({ '--x': `${f.drift}px`, '--rot': `${f.rot}deg` }),
              }}
            >
              {f.emoji}
            </span>
          ))}
          {bursts > 0 && <ConfettiBurst key={bursts} onDone={clearBurst} />}
          <div className="tour-toast" data-on={toast !== ''} role="status">
            {toast}
          </div>
        </div>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {group.name}. {slideAnnouncement(slide)}
        </div>
      </div>
    </div>
  )
}
