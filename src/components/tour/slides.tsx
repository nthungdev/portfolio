'use client'

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import about from '@/content/about'
import { iconSegments } from '@/lib/tour/icons'
import { terminalDelays, type Slide, type Sticker } from '@/lib/tour/build-tour'
import type { StoryIcon } from '@/lib/timeline/types'

/** Consumes a tap or arrow key inside the slide; returns false to let the slide change. */
export type Stepper = (dir: 1 | -1) => boolean

/** What a slide needs from the player; side faces get an inactive env. */
export interface SlideEnv {
  active: boolean
  paused: boolean
  reduce: boolean
  /** `celebrate` fires confetti (correct quiz answer); `message` is a short toast. */
  onAnswer: (celebrate: boolean, message?: string) => void
  onOpenLog: (id: string) => void
  onIssue: () => void
  onCopyEmail: () => void
  /** Closes the tour and prefills the contact form with `Re: subject`. */
  onContact: (subject: string) => void
  /** Restarts the slide's progress bar `ms` into its duration. Stable. */
  seekBar: (key: string, ms: number) => void
  /** Lets the front slide take taps and arrow keys before they change slides. Stable. */
  registerStepper: (stepper: Stepper | null) => void
}

type CssVars = Record<`--${string}`, string | number>
// CSSProperties has no index signature for custom properties.
const vars = (v: CssVars): CSSProperties => v as CSSProperties

const toneColor = (tone: Slide['tone']): string =>
  tone === 'hi'
    ? 'var(--branch-1)'
    : tone === 'work'
      ? 'var(--lane-work)'
      : tone === 'education'
        ? 'var(--lane-edu)'
        : 'var(--lane-proj)'

/** Text read aloud when this slide becomes the front one. */
export function slideAnnouncement(slide: Slide): string {
  switch (slide.kind) {
    case 'intro':
      return `${slide.heading}. ${slide.text}`
    case 'role':
      return `${slide.label}. ${slide.title}, ${slide.org}. ${slide.text}`
    case 'quiz':
      return `Quick quiz. ${slide.quiz.question}`
    case 'poll':
      return `This or that. ${slide.question}`
    case 'number':
      return `${slide.prefix}${slide.value || ''}${slide.suffix}. ${slide.text}`
    case 'project':
      return `Built, ${slide.year}. ${slide.title}. ${slide.text}`
    case 'keys':
      return `Toolbox, ${slide.label}: ${slide.items.join(', ')}`
    case 'finish':
      return `${slide.heading} ${slide.text}`
    case 'scratch':
      return `Scratch card. ${slide.heading}.`
    case 'slider':
      return `Emoji slider. ${slide.question}`
    case 'terminal':
      return `Terminal. ${slide.lines.map((l) => `${l.cmd}: ${l.out}`).join('. ')}`
    case 'reel':
      return `Highlight reel. ${slide.items.map((i) => i.title).join(', ')}.`
    case 'swipe':
      return `Swipe through ${slide.cards.length} projects: mark each one interesting or skip it.`
    case 'flip':
      return `Then and now. ${slide.then.year}: ${slide.then.text}. ${slide.now.year}: ${slide.now.text}.`
  }
}

/**
 * One-shot timeout that only counts down while `run` is true, so it honours the tour's
 * pause. Changing `resetKey` re-arms it with the full `ms`.
 */
function usePausableTimeout(run: boolean, ms: number, onFire: () => void, resetKey: unknown = 0): void {
  const fire = useRef(onFire)
  const remaining = useRef(ms)
  const fired = useRef(false)

  useEffect(() => {
    fire.current = onFire
  })

  useEffect(() => {
    remaining.current = ms
    fired.current = false
  }, [ms, resetKey])

  useEffect(() => {
    if (!run || fired.current) return
    const started = performance.now()
    const timer = window.setTimeout(() => {
      fired.current = true
      fire.current()
    }, remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (performance.now() - started))
    }
  }, [run, ms, resetKey])
}

function Words({ text, spanMs, startS = 0.35 }: { text: string; spanMs: number; startS?: number }) {
  const words = text.split(' ')
  const step = spanMs / words.length / 1000
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span className="tour-w" style={{ animationDelay: `${(startS + i * step).toFixed(2)}s` }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}

function PlotIcon({ icon }: { icon: StoryIcon }) {
  return (
    <svg className="tour-plot" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {iconSegments(icon).map((d, i) => (
        <path key={i} pathLength={1} d={d} style={{ animationDelay: `${0.15 + i * 0.25}s` }} />
      ))}
    </svg>
  )
}

// Fixed spots below the title block so stickers never cover the progress bars.
const STICKER_SLOTS = [
  { top: 104, right: 18, rot: 5, delay: 0.9 },
  { top: 158, right: 30, rot: -4, delay: 1.2 },
  { top: 212, right: 22, rot: 3, delay: 1.5 },
]

function Stickers({ items }: { items: Sticker[] }) {
  return (
    <>
      {items.map((sticker, i) => {
        const slot = STICKER_SLOTS[i % STICKER_SLOTS.length]
        return (
          <span
            key={`${sticker.text}-${i}`}
            className="tour-stk"
            data-tone={sticker.tone}
            style={vars({
              '--top': `${slot.top}px`,
              '--right': `${slot.right}px`,
              '--r': `${slot.rot}deg`,
              '--d': `${slot.delay}s`,
            })}
          >
            {sticker.text}
          </span>
        )
      })}
    </>
  )
}

/** Counts 0 to `value` with an ease-out cubic; the ticking text is hidden from assistive tech. */
function CountUp({
  value,
  prefix = '',
  suffix = '',
  run,
  reduce,
  ms = 1400,
}: {
  value: number
  prefix?: string
  suffix?: string
  run: boolean
  reduce: boolean
  ms?: number
}) {
  const animate = run && !reduce
  const [shown, setShown] = useState(animate ? 0 : value)

  useEffect(() => {
    if (!animate) {
      setShown(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms)
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))))
      if (k < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animate, value, ms])

  return (
    <>
      <span aria-hidden="true">{`${prefix}${shown.toLocaleString('en-US')}${suffix}`}</span>
      <span className="sr-only">{`${prefix}${value.toLocaleString('en-US')}${suffix}`}</span>
    </>
  )
}

function SeeInLog({ slide, env }: { slide: Slide; env: SlideEnv }) {
  const id = slide.logId
  if (!id) return null
  return (
    <button type="button" className="tour-see" onClick={() => env.onOpenLog(id)}>
      Open in the log ↗
    </button>
  )
}

function Frame({ slide, label, children }: { slide: Slide; label: string; children: ReactNode }) {
  return (
    <div
      className="tour-slide"
      style={vars({ '--c': toneColor(slide.tone), '--dur': `${slide.durationMs}ms` })}
    >
      <div>
        <span className="tour-k">{label}</span>
      </div>
      {children}
    </div>
  )
}

function Intro({ slide }: { slide: Extract<Slide, { kind: 'intro' }> }) {
  return (
    <Frame slide={slide} label="Hi">
      <div className="tour-mid">
        <div className="tour-intro-head">
          {slide.image && (
            <span className="tour-ring" style={{ width: 96, height: 96 }}>
              <Image
                src={slide.image}
                alt=""
                width={96}
                height={96}
                className="h-full w-full rounded-full border-2 border-bp-surface object-cover"
              />
            </span>
          )}
          <PlotIcon icon={slide.icon} />
        </div>
        <h3>
          <Words text={slide.heading} spanMs={2000} />
        </h3>
        <p className="tour-say">
          <Words text={slide.text} spanMs={slide.durationMs * 0.55} />
        </p>
      </div>
      <Stickers items={slide.stickers} />
    </Frame>
  )
}

function Role({ slide, env }: { slide: Extract<Slide, { kind: 'role' }>; env: SlideEnv }) {
  return (
    <Frame slide={slide} label={slide.label}>
      <div className="tour-mid">
        <PlotIcon icon={slide.icon} />
        <h3>{slide.title}</h3>
        <p className="tour-say">
          <Words text={slide.text} spanMs={slide.durationMs * 0.55} />
        </p>
      </div>
      <Stickers items={slide.stickers} />
      <SeeInLog slide={slide} env={env} />
    </Frame>
  )
}

interface ChoicesProps {
  options: string[]
  /** Index of the right option; polls have none. */
  answer?: number
  active: boolean
  pick: number | null
  onPick: (index: number) => void
}

function Choices({ options, answer, active, pick, onPick }: ChoicesProps) {
  const done = pick !== null
  return (
    <div className="tour-opts">
      {options.map((option, i) => {
        const right = done && answer === i
        const wrong = done && answer !== undefined && i === pick && i !== answer
        return (
          <button
            key={option}
            type="button"
            data-state={right ? 'right' : wrong ? 'wrong' : undefined}
            aria-pressed={done ? i === pick : undefined}
            onClick={() => {
              if (!done && active) onPick(i)
            }}
          >
            <span className="tour-fill-bg" data-on={i === pick} />
            {option}
            <em>{i === pick ? 'your pick' : right ? 'answer' : ''}</em>
          </button>
        )
      })}
    </div>
  )
}

function Quiz({ slide, env }: { slide: Extract<Slide, { kind: 'quiz' }>; env: SlideEnv }) {
  const { quiz } = slide
  const [pick, setPick] = useState<number | null>(null)
  const done = pick !== null

  return (
    <Frame slide={slide} label="Quick quiz">
      <div className="tour-mid tour-quiz">
        <h3 style={{ fontSize: 24 }}>{quiz.question}</h3>
        <Choices
          options={quiz.options}
          answer={quiz.answer}
          active={env.active}
          pick={pick}
          onPick={(i) => {
            setPick(i)
            const right = i === quiz.answer
            env.onAnswer(right, right ? 'You got it 🎉' : 'Good guess, it was more')
          }}
        />
        {!done && <span className="tour-hintq">Tap your guess</span>}
        {done && (
          <div className="tour-reveal">
            <div className="tour-big">
              <CountUp
                value={quiz.reveal.value}
                prefix={quiz.reveal.prefix}
                suffix={quiz.reveal.suffix}
                run={env.active}
                reduce={env.reduce}
                ms={1600}
              />
            </div>
            <p className="tour-say" style={{ fontSize: 17 }}>
              {quiz.caption}
            </p>
            <p className="sr-only" role="status">
              {pick === quiz.answer ? 'Correct.' : `The answer was ${quiz.options[quiz.answer]}.`}
            </p>
          </div>
        )}
      </div>
    </Frame>
  )
}

function Poll({ slide, env }: { slide: Extract<Slide, { kind: 'poll' }>; env: SlideEnv }) {
  const [pick, setPick] = useState<number | null>(null)
  return (
    <Frame slide={slide} label="This or that">
      <div className="tour-mid tour-quiz">
        <h3>{slide.question}</h3>
        <Choices
          options={slide.options}
          active={env.active}
          pick={pick}
          onPick={(i) => {
            setPick(i)
            env.onAnswer(false)
          }}
        />
        {pick === null ? (
          <span className="tour-hintq">Tap your pick</span>
        ) : (
          <div className="tour-reveal">
            <p className="tour-say" style={{ fontSize: 18 }} role="status">
              {slide.caption}
            </p>
          </div>
        )}
      </div>
    </Frame>
  )
}

function NumberSlide({ slide, env }: { slide: Extract<Slide, { kind: 'number' }>; env: SlideEnv }) {
  // buildTour sets value 0 and puts the raw highlight in `prefix` when there is nothing to count.
  const countable = slide.value !== 0
  return (
    <Frame slide={slide} label="Proud of">
      <div className="tour-mid">
        <div className="tour-big">
          {countable ? (
            <CountUp
              value={slide.value}
              prefix={slide.prefix}
              suffix={slide.suffix}
              run={env.active}
              reduce={env.reduce}
            />
          ) : (
            slide.prefix
          )}
        </div>
        <p className="tour-say">
          <Words text={slide.text} spanMs={3000} />
        </p>
      </div>
      <Stickers items={[{ text: slide.source, tone: 'plain' }]} />
    </Frame>
  )
}

function Project({ slide, env }: { slide: Extract<Slide, { kind: 'project' }>; env: SlideEnv }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { video, image } = slide
  const play = env.active && !env.paused && !env.reduce

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (play) void el.play().catch(() => {})
    else el.pause()
  }, [play])

  return (
    <Frame slide={slide} label={`Built · ${slide.year}${video ? ' · live site' : ''}`}>
      <div className="tour-mid">
        {video ? (
          <div className="tour-vid" style={{ aspectRatio: `${video.width} / ${video.height}` }}>
            <video
              ref={videoRef}
              src={video.src}
              poster={video.poster}
              width={video.width}
              height={video.height}
              muted
              playsInline
              loop
              autoPlay={play}
              preload="metadata"
              aria-label={`${slide.title} site preview`}
            />
          </div>
        ) : (
          image && (
            <div className="tour-kb">
              <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="360px" />
            </div>
          )
        )}
        <h3 style={{ fontSize: 24 }}>{slide.title}</h3>
        <p className="tour-say" style={{ fontSize: 17 }}>
          <Words text={slide.text} spanMs={slide.durationMs * 0.55} />
        </p>
      </div>
      <SeeInLog slide={slide} env={env} />
    </Frame>
  )
}

function Keys({ slide }: { slide: Extract<Slide, { kind: 'keys' }> }) {
  return (
    <Frame slide={slide} label={`Toolbox · ${slide.label}`}>
      <div className="tour-mid">
        <h3>{slide.label}</h3>
        <ul className="tour-keys">
          {slide.items.map((item, i) => (
            <li key={item} style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Frame>
  )
}

function Finish({ slide, env }: { slide: Extract<Slide, { kind: 'finish' }>; env: SlideEnv }) {
  return (
    <Frame slide={slide} label="That's the tour">
      <div className="tour-mid">
        <PlotIcon icon={slide.icon} />
        <h3>{slide.heading}</h3>
        <p className="tour-say">{slide.text}</p>
        <div className="tour-cta">
          <button type="button" className="tour-pri" onClick={env.onIssue}>
            Open an issue
          </button>
          <button type="button" onClick={env.onCopyEmail}>
            Copy email · {about.email}
          </button>
          <Link href="/resume">Open resume</Link>
        </div>
      </div>
    </Frame>
  )
}

const SCRATCH_CLEAR = 0.45
const SCRATCH_LINE = 34

function Scratch({ slide, env }: { slide: Extract<Slide, { kind: 'scratch' }>; env: SlideEnv }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coverRef = useRef<HTMLButtonElement>(null)
  const prizeRef = useRef<HTMLDivElement>(null)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const moves = useRef(0)
  const demoFrame = useRef(0)
  const revealedRef = useRef(false)
  const [touched, setTouched] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const { active, onAnswer } = env

  const reveal = useCallback(() => {
    if (revealedRef.current || !active) return
    revealedRef.current = true
    cancelAnimationFrame(demoFrame.current)
    if (document.activeElement === coverRef.current) prizeRef.current?.focus({ preventScroll: true })
    setRevealed(true)
    onAnswer(true)
  }, [active, onAnswer])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    const css = getComputedStyle(canvas)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, css.getPropertyValue('--branch-1').trim() || '#b8a8ff')
    gradient.addColorStop(1, css.getPropertyValue('--bp-accent').trim() || '#5ad1ff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = 'rgb(255 255 255 / 0.92)'
    ctx.font = `600 ${16 * dpr}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('scratch here', canvas.width / 2, canvas.height / 2)
    return () => cancelAnimationFrame(demoFrame.current)
  }, [])

  const scratchTo = (x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || canvas.clientWidth === 0) return
    const dpr = canvas.width / canvas.clientWidth
    const from = lastPoint.current ?? { x, y }
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = SCRATCH_LINE * dpr
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x * dpr, from.y * dpr)
    ctx.lineTo(x * dpr + 0.01, y * dpr)
    ctx.stroke()
    lastPoint.current = { x, y }
  }

  const clearedShare = (): number => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || canvas.width === 0) return 0
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    let total = 0
    // Every 16th pixel is plenty to estimate coverage.
    for (let i = 3; i < data.length; i += 64) {
      total++
      if (data[i] === 0) clear++
    }
    return clear / total
  }

  const local = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const stopDemo = () => {
    cancelAnimationFrame(demoFrame.current)
    setTouched(true)
  }

  usePausableTimeout(active && !env.paused && !env.reduce && !touched && !revealed, 2200, () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const points = Array.from({ length: 8 }, (_, k) => ({
      x: w * (k % 2 === 0 ? 0.12 : 0.88),
      y: h * (0.12 + (0.76 * k) / 7),
    }))
    const start = performance.now()
    const totalMs = 1400
    lastPoint.current = points[0]
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / totalMs) * (points.length - 1)
      const i = Math.min(points.length - 2, Math.floor(k))
      const t = k - i
      scratchTo(points[i].x + (points[i + 1].x - points[i].x) * t, points[i].y + (points[i + 1].y - points[i].y) * t)
      if (k < points.length - 1) demoFrame.current = requestAnimationFrame(tick)
      else reveal()
    }
    demoFrame.current = requestAnimationFrame(tick)
  })

  return (
    <Frame slide={slide} label="Proud of">
      <div className="tour-mid">
        <h3 style={{ fontSize: 24 }}>{slide.heading}</h3>
        <div className="tour-scr" data-revealed={revealed}>
          <div ref={prizeRef} className="tour-scr-prize" tabIndex={-1}>
            <div className="tour-big">{slide.value}</div>
            <p className="tour-say" style={{ fontSize: 17 }}>
              {slide.text}
            </p>
            <span className="tour-hintq">{slide.source}</span>
          </div>
          <button
            ref={coverRef}
            type="button"
            className="tour-scr-cover"
            aria-label="Scratch card: press to reveal"
            aria-hidden={revealed || undefined}
            disabled={revealed}
            onClick={(event) => {
              // Pointer clicks scratch; only keyboard activation (detail 0) reveals at once.
              if (event.detail === 0) reveal()
            }}
          >
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              onPointerDown={(event) => {
                if (revealedRef.current || !active) return
                event.currentTarget.setPointerCapture(event.pointerId)
                stopDemo()
                lastPoint.current = null
                const p = local(event)
                scratchTo(p.x, p.y)
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId) || revealedRef.current) return
                const p = local(event)
                scratchTo(p.x, p.y)
                moves.current++
                if (moves.current % 8 === 0 && clearedShare() > SCRATCH_CLEAR) reveal()
              }}
              onPointerUp={() => {
                lastPoint.current = null
                if (!revealedRef.current && clearedShare() > SCRATCH_CLEAR) reveal()
              }}
            />
          </button>
        </div>
        {env.reduce && !revealed && (
          <button type="button" className="tour-pill-btn" onClick={reveal}>
            Reveal
          </button>
        )}
        {revealed && (
          <p className="sr-only" role="status">
            {`${slide.value}. ${slide.text}`}
          </p>
        )}
      </div>
    </Frame>
  )
}

const SLIDER_DEMO = 92

function EmojiSlider({ slide, env }: { slide: Extract<Slide, { kind: 'slider' }>; env: SlideEnv }) {
  const [value, setValue] = useState(0)
  const [touched, setTouched] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const moved = useRef(false)
  const revealedRef = useRef(false)
  const glide = useRef(0)
  const { active, onAnswer } = env

  const reveal = useCallback(() => {
    if (revealedRef.current || !active) return
    revealedRef.current = true
    setRevealed(true)
    onAnswer(false)
  }, [active, onAnswer])

  useEffect(() => () => cancelAnimationFrame(glide.current), [])

  usePausableTimeout(active && !env.paused && !env.reduce && !touched && !revealed, 1800, () => {
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 900)
      setValue(Math.round(SLIDER_DEMO * (1 - Math.pow(1 - k, 3))))
      if (k < 1) glide.current = requestAnimationFrame(tick)
      else reveal()
    }
    glide.current = requestAnimationFrame(tick)
  })

  const touch = () => {
    if (touched) return
    cancelAnimationFrame(glide.current)
    setTouched(true)
  }
  const release = () => {
    if (moved.current) reveal()
  }

  return (
    <Frame slide={slide} label="Now · tinkering">
      <div className="tour-mid">
        <div className="tour-sld">
          <p>{slide.question}</p>
          <div className="tour-sld-track" style={vars({ '--v': value })}>
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              aria-label={slide.question}
              aria-valuetext={`${value} out of 100`}
              onPointerDown={touch}
              onKeyDown={touch}
              onChange={(event) => {
                touch()
                moved.current = true
                setValue(Number(event.target.value))
              }}
              onPointerUp={release}
              onKeyUp={release}
              onBlur={release}
            />
            <span className="tour-sld-emoji" aria-hidden="true">
              {slide.emoji}
            </span>
          </div>
        </div>
        {revealed ? (
          <div className="tour-reveal" role="status">
            <h3 style={{ fontSize: 26 }}>{slide.heading}</h3>
            <p className="tour-say" style={{ fontSize: 17 }}>
              {slide.caption}
            </p>
          </div>
        ) : (
          <span className="tour-hintq">Slide to answer</span>
        )}
      </div>
    </Frame>
  )
}

function Terminal({ slide, env }: { slide: Extract<Slide, { kind: 'terminal' }>; env: SlideEnv }) {
  const delays = useMemo(() => terminalDelays(slide.lines), [slide.lines])
  const [step, setStep] = useState(0)
  const total = delays.length
  const shown = env.reduce || !env.active ? total : step

  usePausableTimeout(env.active && !env.paused && !env.reduce && step < total, delays[step] ?? 0, () =>
    setStep((n) => n + 1), step)

  let left = shown
  const rows = slide.lines.map((line) => {
    const chars = Math.max(0, Math.min(line.cmd.length, left))
    left -= line.cmd.length
    const out = left > 0
    left -= 1
    return { line, chars, out }
  })
  const current = shown < total ? rows.findIndex((r) => !r.out) : -1

  return (
    <Frame slide={slide} label="Now · side projects">
      <div className="tour-mid">
        <div className="tour-term">
          <div className="tour-term-bar" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="tour-term-body" aria-hidden="true">
            {rows.map(({ line, chars, out }, i) =>
              chars > 0 || i === current ? (
                <Fragment key={i}>
                  <p>
                    <span className="tour-term-ps">{slide.prompt}</span> {line.cmd.slice(0, chars)}
                    {i === current && <span className="tour-caret" />}
                  </p>
                  {out && <p className="tour-term-out">{line.out}</p>}
                </Fragment>
              ) : null,
            )}
            {current === -1 && (
              <p>
                <span className="tour-term-ps">{slide.prompt}</span> <span className="tour-caret" />
              </p>
            )}
          </div>
          <div className="sr-only">
            {slide.lines.map((l) => `${slide.prompt} ${l.cmd}. ${l.out}`).join(' ')}
          </div>
        </div>
      </div>
    </Frame>
  )
}

function Reel({ slide, env }: { slide: Extract<Slide, { kind: 'reel' }>; env: SlideEnv }) {
  const [index, setIndex] = useState(0)
  const last = slide.items.length - 1
  const item = slide.items[index]
  const { active, seekBar, registerStepper } = env
  const stepRef = useRef<Stepper>(() => false)

  useEffect(() => {
    if (active) seekBar(slide.key, index * slide.stepMs)
  }, [active, seekBar, slide.key, slide.stepMs, index])

  useEffect(() => {
    stepRef.current = (dir) => {
      const target = index + dir
      if (target < 0 || target > last) return false
      setIndex(target)
      return true
    }
  })

  useEffect(() => {
    if (!active) return
    registerStepper((dir) => stepRef.current(dir))
    return () => registerStepper(null)
  }, [active, registerStepper])

  usePausableTimeout(active && !env.paused && !env.reduce && index < last, slide.stepMs, () =>
    setIndex((i) => Math.min(last, i + 1)), index)

  return (
    <div
      className="tour-slide tour-reel"
      style={vars({ '--c': toneColor(slide.tone), '--dur': `${slide.stepMs}ms` })}
    >
      {slide.items.map((it, i) => (
        <div key={it.id} className="tour-reel-img" data-on={i === index} aria-hidden={i !== index || undefined}>
          <Image
            src={it.image.src}
            alt={it.image.alt}
            width={it.image.width}
            height={it.image.height}
            sizes="(min-width: 768px) 490px, 100vw"
          />
        </div>
      ))}
      <span className="tour-k tour-reel-k">
        Built · highlight reel · {index + 1}/{slide.items.length}
      </span>
      <div key={item.id} className="tour-reel-cap">
        <span className="tour-reel-stamp">{item.title}</span>
        <p>{item.text}</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {`${item.title}. ${item.text}`}
      </p>
    </div>
  )
}

const SWIPE_PX = 70
const SWIPE_OUT_MS = 220
const SWIPE_DEMO: readonly (1 | -1)[] = [1, -1, 1]

function Swipe({ slide, env }: { slide: Extract<Slide, { kind: 'swipe' }>; env: SlideEnv }) {
  const { cards } = slide
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState<string[]>([])
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [leaving, setLeaving] = useState<1 | -1 | 0>(0)
  const [touched, setTouched] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const drag = useRef<{ x: number; id: number } | null>(null)
  const leaveTimer = useRef(0)
  const deckRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const focusCta = useRef(false)
  const done = index >= cards.length

  useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  useEffect(() => {
    if (done && focusCta.current) ctaRef.current?.focus({ preventScroll: true })
  }, [done])

  const decide = (dir: 1 | -1) => {
    if (leaving || done || !env.active) return
    const card = cards[index]
    if (dir === 1) setLiked((all) => [...all, card.id])
    const commit = () => {
      if (index === cards.length - 1) {
        focusCta.current = Boolean(deckRef.current?.contains(document.activeElement))
        env.onAnswer(false)
      }
      setLeaving(0)
      setDx(0)
      setIndex(index + 1)
    }
    if (env.reduce) {
      commit()
      return
    }
    setLeaving(dir)
    leaveTimer.current = window.setTimeout(commit, SWIPE_OUT_MS)
  }

  usePausableTimeout(
    env.active && !env.paused && !env.reduce && !touched && !done && !leaving,
    demoStep === 0 ? 2200 : 1500,
    () => {
      decide(SWIPE_DEMO[demoStep % SWIPE_DEMO.length])
      setDemoStep((n) => n + 1)
    },
    demoStep,
  )

  const likedCards = cards.filter((c) => liked.includes(c.id))

  if (done) {
    return (
      <Frame slide={slide} label="Built · your picks">
        <div className="tour-mid">
          <h3 role="status">You liked {likedCards.length}</h3>
          {likedCards.length > 0 && (
            <ul className="tour-keys">
              {likedCards.map((c, i) => (
                <li key={c.id} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  {c.title}
                </li>
              ))}
            </ul>
          )}
          <div className="tour-cta">
            <button
              ref={ctaRef}
              type="button"
              className="tour-pri"
              onClick={() =>
                env.onContact(likedCards.length > 0 ? likedCards.map((c) => c.title).join(', ') : 'your tour')
              }
            >
              {likedCards.length > 0 ? 'Ask me about these →' : 'Say hi →'}
            </button>
          </div>
        </div>
      </Frame>
    )
  }

  const card = cards[index]
  const offset = leaving ? 0 : dx
  const likeOn = leaving === 1 ? 1 : Math.max(0, Math.min(1, offset / SWIPE_PX))
  const nopeOn = leaving === -1 ? 1 : Math.max(0, Math.min(1, -offset / SWIPE_PX))
  const transform = leaving
    ? `translateX(${leaving * 150}%) rotate(${leaving * 18}deg)`
    : `translateX(${offset}px) rotate(${offset / 18}deg)`

  return (
    <Frame slide={slide} label="Built · swipe">
      <div className="tour-mid tour-swp" ref={deckRef} onKeyDown={() => setTouched(true)}>
        <div className="tour-swp-deck">
          {cards
            .slice(index, index + 3)
            .reverse()
            .map((c, i, shown) => {
              const depth = shown.length - 1 - i
              const top = depth === 0
              return (
                <div
                  key={c.id}
                  className="tour-swp-card"
                  data-tour-ui={top || undefined}
                  aria-hidden={!top || undefined}
                  style={
                    top
                      ? { transform, transition: dragging || env.reduce ? 'none' : undefined }
                      : { transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.05})` }
                  }
                  onPointerDown={
                    top
                      ? (event) => {
                          if (leaving || !env.active) return
                          setTouched(true)
                          drag.current = { x: event.clientX, id: event.pointerId }
                          setDragging(true)
                          event.currentTarget.setPointerCapture(event.pointerId)
                        }
                      : undefined
                  }
                  onPointerMove={
                    top
                      ? (event) => {
                          if (drag.current?.id === event.pointerId) setDx(event.clientX - drag.current.x)
                        }
                      : undefined
                  }
                  onPointerUp={
                    top
                      ? (event) => {
                          const start = drag.current
                          drag.current = null
                          setDragging(false)
                          if (!start) return
                          const d = event.clientX - start.x
                          if (Math.abs(d) > SWIPE_PX) decide(d > 0 ? 1 : -1)
                          else setDx(0)
                        }
                      : undefined
                  }
                  onPointerCancel={
                    top
                      ? () => {
                          drag.current = null
                          setDragging(false)
                          setDx(0)
                        }
                      : undefined
                  }
                >
                  <div className="tour-swp-img">
                    <Image
                      src={c.image.src}
                      alt={c.image.alt}
                      width={c.image.width}
                      height={c.image.height}
                      sizes="360px"
                      draggable={false}
                    />
                  </div>
                  <div className="tour-swp-txt">
                    <h4>{c.title}</h4>
                    <p>{c.text}</p>
                  </div>
                  {top && (
                    <>
                      <span className="tour-swp-stamp" data-kind="like" style={{ opacity: likeOn }} aria-hidden="true">
                        LIKE
                      </span>
                      <span className="tour-swp-stamp" data-kind="nope" style={{ opacity: nopeOn }} aria-hidden="true">
                        NOPE
                      </span>
                    </>
                  )}
                </div>
              )
            })}
        </div>
        <div className="tour-swp-btns">
          <button
            type="button"
            aria-label="Skip"
            onClick={() => {
              setTouched(true)
              decide(-1)
            }}
          >
            ✕
          </button>
          <button
            type="button"
            aria-label="Interested"
            onClick={() => {
              setTouched(true)
              decide(1)
            }}
          >
            ♥
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {`Project ${index + 1} of ${cards.length}: ${card.title}. ${card.text}`}
        </p>
      </div>
    </Frame>
  )
}

function Flip({ slide, env }: { slide: Extract<Slide, { kind: 'flip' }>; env: SlideEnv }) {
  const [flipped, setFlipped] = useState(false)
  const [touched, setTouched] = useState(false)

  usePausableTimeout(env.active && !env.paused && !env.reduce && !touched, 2600, () => setFlipped(true))

  const faces = [
    { side: 'then', label: 'Then', face: slide.then },
    { side: 'now', label: 'Now', face: slide.now },
  ] as const

  return (
    <Frame slide={slide} label="Career · then and now">
      <div className="tour-mid">
        <button
          type="button"
          className="tour-flip"
          aria-pressed={flipped}
          data-flipped={flipped}
          onClick={() => {
            setTouched(true)
            setFlipped((value) => !value)
          }}
        >
          <span className="tour-flip-in">
            {faces.map(({ side, label, face }) => (
              <span
                key={side}
                className="tour-flip-face"
                data-side={side}
                aria-hidden={(side === 'now') !== flipped || undefined}
              >
                <span className="tour-k">{label}</span>
                <span className="tour-big">{face.year}</span>
                <span className="tour-flip-t">{face.text}</span>
              </span>
            ))}
          </span>
        </button>
        <span className="tour-hintq" aria-hidden="true">
          {slide.hint}
        </span>
      </div>
    </Frame>
  )
}

/** Renders one slide; the player remounts it (by key) whenever it becomes the front slide. */
export function SlideView({ slide, env }: { slide: Slide; env: SlideEnv }) {
  switch (slide.kind) {
    case 'intro':
      return <Intro slide={slide} />
    case 'role':
      return <Role slide={slide} env={env} />
    case 'quiz':
      return <Quiz slide={slide} env={env} />
    case 'poll':
      return <Poll slide={slide} env={env} />
    case 'number':
      return <NumberSlide slide={slide} env={env} />
    case 'project':
      return <Project slide={slide} env={env} />
    case 'keys':
      return <Keys slide={slide} />
    case 'finish':
      return <Finish slide={slide} env={env} />
    case 'scratch':
      return <Scratch slide={slide} env={env} />
    case 'slider':
      return <EmojiSlider slide={slide} env={env} />
    case 'terminal':
      return <Terminal slide={slide} env={env} />
    case 'reel':
      return <Reel slide={slide} env={env} />
    case 'swipe':
      return <Swipe slide={slide} env={env} />
    case 'flip':
      return <Flip slide={slide} env={env} />
  }
}
