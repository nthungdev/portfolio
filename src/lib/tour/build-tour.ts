import type { SkillLayer } from '@/content/skills'
import type { Highlight } from '@/content/highlights'
import { formatMonth, formatRange } from '@/lib/timeline/format'
import type {
  Lane,
  StoryIcon,
  StoryQuiz,
  StorySlider,
  StoryVideo,
  TimelineEntry,
  TimelineImage,
  YearMonth,
} from '@/lib/timeline/types'

export type TourGroupId = 'hi' | 'now' | 'proud' | 'built' | 'career' | 'toolbox' | 'say-hi'

/** Tilted label that pops in over a slide. `mention` uses the gradient style. */
export interface Sticker {
  text: string
  tone: 'plain' | 'mention'
}

export interface TerminalLine {
  cmd: string
  out: string
}

/** One featured project, shared by the highlight reel and the swipe deck. */
export interface ProjectCard {
  id: string
  title: string
  text: string
  image: TimelineImage
}

/** One side of the then/now flip card. */
export interface FlipFace {
  year: string
  text: string
}

interface SlideBase {
  /** Unique within the tour. */
  key: string
  durationMs: number
  /** Context for "Send a message about …" and the prefilled contact subject. */
  subject: string
  /** Timeline entry the "Open in the log" button reveals. */
  logId?: string
  /** Colour family: a timeline lane, or `hi` for tour-level slides. */
  tone: Lane | 'hi'
}

export type Slide = SlideBase &
  (
    | { kind: 'intro'; heading: string; text: string; icon: StoryIcon; stickers: Sticker[]; image?: string }
    | { kind: 'role'; label: string; title: string; org: string; text: string; icon: StoryIcon; stickers: Sticker[] }
    | { kind: 'quiz'; quiz: StoryQuiz }
    | { kind: 'poll'; question: string; options: string[]; caption: string }
    | { kind: 'number'; value: number; prefix: string; suffix: string; text: string; source: string }
    | { kind: 'project'; title: string; text: string; year: string; video?: StoryVideo; image?: TimelineImage }
    | { kind: 'keys'; label: string; items: string[] }
    | { kind: 'finish'; heading: string; text: string; icon: StoryIcon }
    | { kind: 'scratch'; heading: string; value: string; text: string; source: string }
    | ({ kind: 'slider' } & StorySlider)
    | { kind: 'terminal'; prompt: string; lines: TerminalLine[] }
    | { kind: 'reel'; items: ProjectCard[]; stepMs: number }
    | { kind: 'swipe'; cards: ProjectCard[] }
    | { kind: 'flip'; hint: string; then: FlipFace; now: FlipFace }
  )

export interface TourGroup {
  id: TourGroupId
  name: string
  /** Short text inside the ring. */
  badge: string
  slides: Slide[]
  /** Latest start or end month among the group's entries; drives the "new" badge. */
  updatedAt?: YearMonth
}

export interface TourCopy {
  intro: { text: string; icon: StoryIcon }
  poll: { question: string; options: string[]; caption: string }
  scratch: { heading: string }
  /** Omit, or leave `lines` empty, to drop the terminal slide. */
  terminal?: { prompt: string; lines: TerminalLine[] }
  /** Overrides for the then/now card; entries and text are derived when unset. */
  thenNow: { hint: string; thenId?: string; nowId?: string; thenText?: string; nowText?: string }
  finish: { heading: string; text: string }
}

export interface TourInput {
  about: { name: string; title: string; company: string; location: string }
  timeline: readonly TimelineEntry[]
  highlights: readonly Highlight[]
  skills: readonly SkillLayer[]
  copy: TourCopy
  /** Portrait for the intro slide. */
  portrait?: string
  /** Defaults to `NODE_ENV !== 'production'`. */
  includeDrafts?: boolean
}

const MIN_MS = 3000
const MAX_MS = 8000

const TERMINAL_MAX_MS = 14000
const REEL_STEP_MS = 3200
const TERMINAL_OUT_MS = 250
const TERMINAL_GAP_MS = 450
const TERMINAL_READ_MS = 3500

/**
 * Delay before each frame of the terminal animation: one per typed character, then one
 * that prints the output. Deterministic so the slide duration matches the animation.
 */
export function terminalDelays(lines: readonly TerminalLine[]): number[] {
  let n = 0
  return lines.flatMap((line, i) => [
    ...Array.from(line.cmd, (_, c) => (c === 0 && i > 0 ? TERMINAL_GAP_MS : 0) + 55 + ((n++ * 37) % 51)),
    TERMINAL_OUT_MS,
  ])
}

/** Reading time: 2.2s base plus 260ms a word, clamped to 3–8s. */
export function slideDuration(text: string, extraMs = 0): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(MIN_MS, Math.min(MAX_MS, 2200 + words * 260 + extraMs))
}

/** `100,000+` -> {prefix:'', value:100000, suffix:'+'}; null when there is no number to count. */
export function parseHighlightValue(
  raw: string
): { prefix: string; value: number; suffix: string } | null {
  const match = /^([^\d]*)([\d,]+)(.*)$/.exec(raw.trim())
  if (!match) return null
  const value = Number(match[2].replace(/,/g, ''))
  return Number.isFinite(value) ? { prefix: match[1], value, suffix: match[3] } : null
}

const NEW_WINDOW_DAYS = 90

/** True when the group changed within the last 90 days of `now`. */
export function isGroupNew(group: Pick<TourGroup, 'updatedAt'>, now: Date): boolean {
  if (!group.updatedAt) return false
  const [y, m] = group.updatedAt.split('-').map(Number)
  const updated = Date.UTC(y, m - 1, 1)
  return now.getTime() - updated <= NEW_WINDOW_DAYS * 86_400_000 && updated <= now.getTime()
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const latest = (months: (YearMonth | null | undefined)[]): YearMonth | undefined =>
  months.filter((m): m is YearMonth => typeof m === 'string').sort().at(-1)

function fallbackIcon(entry: TimelineEntry): StoryIcon {
  if (entry.tag === 'lab') return 'spark'
  if (entry.lane === 'education') return 'cap'
  if (entry.lane === 'project') return 'layout'
  return 'layout'
}

function roleSlide(entry: TimelineEntry, label: string, group: TourGroupId): Slide {
  const text = entry.story?.hook ?? entry.plain
  const lab = entry.tag === 'lab'
  return {
    kind: 'role',
    key: `${group}-role-${entry.id}`,
    tone: entry.lane,
    label,
    title: entry.title,
    org: entry.org,
    text,
    icon: entry.story?.icon ?? fallbackIcon(entry),
    stickers: [
      { text: `@${entry.org}`, tone: 'mention' },
      { text: `🗓 ${lab ? 'Right now' : formatRange(entry)}`, tone: 'plain' },
    ],
    durationMs: slideDuration(text, 900),
    subject: `${entry.title} at ${entry.org}`,
    logId: lab ? undefined : entry.id,
  }
}

function quizSlide(entry: TimelineEntry, quiz: StoryQuiz): Slide {
  return {
    kind: 'quiz',
    key: `quiz-${entry.id}`,
    tone: 'hi',
    quiz,
    // The bar starts only after an answer; this is the time left to read the reveal.
    durationMs: 4200,
    subject: `${entry.title} at ${entry.org}`,
  }
}

const yearOf = (month: YearMonth): string => month.slice(0, 4)

function projectCards(entries: readonly TimelineEntry[]): ProjectCard[] {
  return entries.flatMap((e) => {
    const image = e.featured?.images[0]
    return image ? [{ id: e.id, title: e.title, text: e.story?.hook ?? e.plain, image }] : []
  })
}

function flipSlide(
  visible: readonly TimelineEntry[],
  dated: readonly TimelineEntry[],
  copy: TourCopy['thenNow']
): Slide | null {
  const pick = (id?: string) => (id ? visible.find((e) => e.id === id) : undefined)
  const current = dated.filter((e) => e.lane === 'work' && e.end === null)
  const then = pick(copy.thenId) ?? dated.at(-1)
  const now = pick(copy.nowId) ?? current.find((e) => e.head) ?? current[0]
  if (!then || !now || then.id === now.id) return null
  const thenText = copy.thenText ?? `${then.title} · ${then.org}`
  const nowText = copy.nowText ?? `${now.title} · ${now.org}`
  return {
    kind: 'flip',
    key: 'career-flip',
    tone: 'work',
    hint: copy.hint,
    then: { year: yearOf(then.start), text: thenText },
    now: { year: yearOf(now.start), text: nowText },
    // The card flips itself after ~2.6s; leave time to read both faces.
    durationMs: Math.max(6500, slideDuration(`${thenText} ${nowText}`, 2600)),
    subject: 'your career',
  }
}

/** Builds the site-wide stories tour from the content files. Pure; safe to call on the server. */
export function buildTour(input: TourInput): TourGroup[] {
  const includeDrafts = input.includeDrafts ?? process.env.NODE_ENV !== 'production'
  const visible = input.timeline.filter((e) => includeDrafts || !e.draft)
  const lab = visible.filter((e) => e.tag === 'lab')
  const dated = visible
    .filter((e) => e.tag !== 'lab')
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => b.entry.start.localeCompare(a.entry.start) || a.index - b.index)
    .map(({ entry }) => entry)

  const { about, copy } = input
  const hi: TourGroup = {
    id: 'hi',
    name: 'Hi',
    badge: 'HI',
    slides: [
      {
        kind: 'intro',
        key: 'intro',
        tone: 'hi',
        heading: `I'm ${about.name}`,
        text: copy.intro.text,
        icon: copy.intro.icon,
        image: input.portrait,
        stickers: [
          { text: `📍 ${about.location}`, tone: 'plain' },
          { text: `@${about.company} · ${about.title}`, tone: 'mention' },
        ],
        durationMs: slideDuration(copy.intro.text, 1500),
        subject: 'your intro',
      },
    ],
  }

  const ongoing = dated.filter((e) => e.end === null)
  const nowEntries = [...ongoing, ...lab]
  const nowSlides: Slide[] = ongoing.map((e) => roleSlide(e, 'Now', 'now'))
  const sliderEntry = lab.find((e) => e.story?.slider)
  if (sliderEntry?.story?.slider) {
    const { slider } = sliderEntry.story
    nowSlides.push({
      kind: 'slider',
      key: `now-slider-${sliderEntry.id}`,
      tone: sliderEntry.lane,
      ...slider,
      // The bar starts only after the slider is released; this is the time left to read.
      durationMs: slideDuration(`${slider.heading} ${slider.caption}`, 600),
      subject: `${sliderEntry.title} at ${sliderEntry.org}`,
    })
  }
  const terminal = copy.terminal?.lines.length ? copy.terminal : undefined
  if (terminal) {
    const typing = terminalDelays(terminal.lines).reduce((sum, ms) => sum + ms, 0)
    nowSlides.push({
      kind: 'terminal',
      key: 'now-terminal',
      tone: 'hi',
      prompt: terminal.prompt,
      lines: terminal.lines,
      // Typing plus time to read the last output; may run past the usual 8s cap.
      durationMs: Math.max(MIN_MS, Math.min(TERMINAL_MAX_MS, typing + TERMINAL_READ_MS)),
      subject: 'your side projects',
    })
  } else {
    // Without the terminal, lab entries keep their own role slides.
    lab.filter((e) => e !== sliderEntry).forEach((e) => nowSlides.push(roleSlide(e, 'Tinkering', 'now')))
  }
  const now: TourGroup = {
    id: 'now',
    name: 'Now',
    badge: 'NOW',
    slides: nowSlides,
    updatedAt: latest(nowEntries.map((e) => e.start)),
  }

  const career = dated.filter((e) => e.lane !== 'project')
  const quizEntry = career.find((e) => e.story?.quiz)
  const careerSlides: Slide[] = []
  if (quizEntry?.story?.quiz) careerSlides.push(quizSlide(quizEntry, quizEntry.story.quiz))
  career.forEach((e, i) => careerSlides.push(roleSlide(e, `Career · ${i + 1} of ${career.length}`, 'career')))
  const flip = careerSlides.length > 0 ? flipSlide(visible, dated, copy.thenNow) : null
  if (flip) careerSlides.push(flip)
  const careerGroup: TourGroup = {
    id: 'career',
    name: 'Career',
    badge: 'CV',
    slides: careerSlides,
    updatedAt: latest(career.flatMap((e) => [e.start, e.end])),
  }

  // A highlight already revealed by a quiz is not repeated.
  const quizValues = new Set(
    visible.flatMap((e) => (e.story?.quiz ? [e.story.quiz.reveal.value] : []))
  )
  const proud: TourGroup = {
    id: 'proud',
    name: 'Proud of',
    badge: '★',
    slides: input.highlights.flatMap((h, i): Slide[] => {
      const parsed = parseHighlightValue(h.value)
      if (parsed && quizValues.has(parsed.value)) return []
      const text = `${capitalize(h.label)}.`
      if (h.reveal === 'scratch') {
        return [
          {
            kind: 'scratch',
            key: `proud-scratch-${i}`,
            tone: 'hi',
            heading: copy.scratch.heading,
            value: h.value,
            text,
            source: h.source,
            // The bar starts only after the reveal; this is the time left to read.
            durationMs: slideDuration(`${text} ${h.source}`, 1200),
            subject: h.label,
          },
        ]
      }
      return [
        {
          kind: 'number',
          key: `number-${i}`,
          tone: 'hi',
          value: parsed?.value ?? 0,
          prefix: parsed?.prefix ?? h.value,
          suffix: parsed?.suffix ?? '',
          text,
          source: h.source,
          durationMs: slideDuration(text, 1200),
          subject: h.label,
        },
      ]
    }),
  }

  const cards = projectCards(dated)
  const videos = dated.filter((e) => e.story?.video)
  const builtSlides: Slide[] = []
  if (cards.length > 0) {
    builtSlides.push({
      kind: 'reel',
      key: 'built-reel',
      tone: 'project',
      items: cards,
      stepMs: REEL_STEP_MS,
      durationMs: cards.length * REEL_STEP_MS,
      subject: 'your projects',
    })
  }
  videos.forEach((e) => {
    const text = e.story?.hook ?? e.plain
    builtSlides.push({
      kind: 'project',
      key: `project-${e.id}`,
      tone: 'project',
      title: e.title,
      text,
      year: formatMonth(e.start).split(' ')[1],
      video: e.story?.video,
      image: e.featured?.images[0],
      durationMs: Math.max(6500, slideDuration(text)),
      subject: e.title,
      logId: e.id,
    })
  })
  if (cards.length > 0) {
    builtSlides.push({
      kind: 'swipe',
      key: 'built-swipe',
      tone: 'project',
      cards,
      // The bar starts only after the deck is done; this is the time to read the summary.
      durationMs: 5000,
      subject: 'your projects',
    })
  }
  const built: TourGroup = {
    id: 'built',
    name: 'Built',
    badge: 'PR',
    slides: builtSlides,
    updatedAt: latest([...videos, ...dated.filter((e) => e.featured)].map((e) => e.start)),
  }

  const toolbox: TourGroup = {
    id: 'toolbox',
    name: 'Toolbox',
    badge: '⌘',
    slides: [
      {
        kind: 'poll',
        key: 'poll',
        tone: 'work',
        question: copy.poll.question,
        options: copy.poll.options,
        caption: copy.poll.caption,
        durationMs: 4200,
        subject: copy.poll.question,
      },
      ...[...input.skills].reverse().map(
        (layer): Slide => ({
          kind: 'keys',
          key: `keys-${layer.id}`,
          tone: 'work',
          label: layer.label,
          items: layer.items,
          durationMs: Math.min(MAX_MS, 2600 + layer.items.length * 250),
          subject: `your ${layer.label} skills`,
        })
      ),
    ],
  }

  const sayHi: TourGroup = {
    id: 'say-hi',
    name: 'Say hi',
    badge: '✉',
    slides: [
      {
        kind: 'finish',
        key: 'finish',
        tone: 'hi',
        heading: copy.finish.heading,
        text: copy.finish.text,
        icon: 'wave',
        durationMs: 9000,
        subject: 'your tour',
      },
    ],
  }

  return [hi, now, proud, built, careerGroup, toolbox, sayHi].filter((g) => g.slides.length > 0)
}
