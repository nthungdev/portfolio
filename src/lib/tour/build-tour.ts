import type { SkillLayer } from '@/content/skills'
import type { Highlight } from '@/content/highlights'
import { formatMonth, formatRange } from '@/lib/timeline/format'
import type {
  Lane,
  StoryIcon,
  StoryQuiz,
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

function roleSlide(entry: TimelineEntry, label: string): Slide {
  const text = entry.story?.hook ?? entry.plain
  const lab = entry.tag === 'lab'
  return {
    kind: 'role',
    key: `role-${entry.id}`,
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

  const nowEntries = [...dated.filter((e) => e.end === null), ...lab]
  const now: TourGroup = {
    id: 'now',
    name: 'Now',
    badge: 'NOW',
    slides: nowEntries.map((e) => roleSlide(e, e.tag === 'lab' ? 'Tinkering' : 'Now')),
    updatedAt: latest(nowEntries.map((e) => e.start)),
  }

  const career = dated.filter((e) => e.lane !== 'project')
  const quizEntry = career.find((e) => e.story?.quiz)
  const careerSlides: Slide[] = []
  if (quizEntry?.story?.quiz) careerSlides.push(quizSlide(quizEntry, quizEntry.story.quiz))
  career.forEach((e, i) => careerSlides.push(roleSlide(e, `Career · ${i + 1} of ${career.length}`)))
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

  const featured = dated
    .filter((e) => e.featured || e.story?.video)
    .sort((a, b) => Number(Boolean(b.story?.video)) - Number(Boolean(a.story?.video)))
  const built: TourGroup = {
    id: 'built',
    name: 'Built',
    badge: 'PR',
    slides: featured.map((e) => {
      const text = e.story?.hook ?? e.plain
      return {
        kind: 'project',
        key: `project-${e.id}`,
        tone: 'project',
        title: e.title,
        text,
        year: formatMonth(e.start).split(' ')[1],
        video: e.story?.video,
        image: e.featured?.images[0],
        durationMs: e.story?.video ? Math.max(6500, slideDuration(text)) : slideDuration(text, 1500),
        subject: e.title,
        logId: e.id,
      }
    }),
    updatedAt: latest(featured.map((e) => e.start)),
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
