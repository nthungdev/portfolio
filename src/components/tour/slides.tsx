'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import about from '@/content/about'
import { iconSegments } from '@/lib/tour/icons'
import type { Slide, Sticker } from '@/lib/tour/build-tour'
import type { StoryIcon } from '@/lib/timeline/types'

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
  }
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
  }
}
