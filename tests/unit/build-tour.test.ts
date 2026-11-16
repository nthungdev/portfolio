import { describe, expect, it } from 'vitest'
import timeline from '@/content/timeline'
import highlights from '@/content/highlights'
import skills from '@/content/skills'
import about from '@/content/about'
import tourCopy from '@/content/tour'
import {
  buildTour,
  isGroupNew,
  parseHighlightValue,
  slideDuration,
  terminalDelays,
  type TourInput,
} from '@/lib/tour/build-tour'
import type { TimelineEntry } from '@/lib/timeline/types'

const input: TourInput = {
  about,
  timeline,
  highlights,
  skills,
  copy: tourCopy,
  portrait: '/me.jpg',
  includeDrafts: false,
}

const entry = (over: Partial<TimelineEntry> & { id: string }): TimelineEntry => ({
  lane: 'work',
  title: `T ${over.id}`,
  org: `O ${over.id}`,
  start: '2020-01',
  end: '2021-01',
  diff: { add: [] },
  plain: 'plain text',
  stack: [],
  links: [],
  ...over,
})

const quizBase = {
  question: 'q?',
  options: ['a', 'b'],
  answer: 0,
  caption: 'c',
}

// No terminal copy, so Now only holds what the entries produce.
const bareCopy = { ...tourCopy, terminal: undefined }

const small = (entries: TimelineEntry[], extra: Partial<TourInput> = {}) =>
  buildTour({ ...input, timeline: entries, highlights: [], skills: [], copy: bareCopy, ...extra })

describe('buildTour with real content', () => {
  const groups = buildTour(input)
  const byId = (id: string) => groups.find((g) => g.id === id)!

  it('orders groups and has unique slide keys per group', () => {
    expect(groups.map((g) => g.id)).toEqual(['hi', 'now', 'proud', 'built', 'career', 'toolbox', 'say-hi'])
    for (const g of groups) {
      const keys = g.slides.map((s) => s.key)
      expect(new Set(keys).size, g.id).toBe(keys.length)
    }
  })

  it('Career opens with the quiz, then 14 roles newest first, then the flip card', () => {
    const { slides } = byId('career')
    expect(slides[0].kind).toBe('quiz')
    expect(slides.at(-1)!.kind).toBe('flip')
    const roles = slides.slice(1, -1)
    expect(roles).toHaveLength(14)
    expect(roles.every((s) => s.kind === 'role')).toBe(true)
    const starts = roles.map((s) => timeline.find((e) => s.key.endsWith(`-role-${e.id}`))!.start)
    expect([...starts].sort().reverse()).toEqual(starts)
  })

  it('does not repeat the quiz-revealed highlight in Proud of', () => {
    const { slides } = byId('proud')
    const numbers = slides.flatMap((s) => (s.kind === 'number' ? [s.value] : []))
    expect(numbers).not.toContain(100000)
    expect(slides.filter((s) => s.kind === 'number' || s.kind === 'scratch')).toHaveLength(highlights.length - 1)
  })

  it('Now holds ongoing roles, then the slider, then the terminal', () => {
    const { slides } = byId('now')
    const roles = slides.filter((s) => s.kind === 'role')
    expect(roles.length).toBeGreaterThan(0)
    const entries = roles.map((s) => timeline.find((e) => s.key.endsWith(`-role-${e.id}`))!)
    expect(entries.every((e) => e.end === null && e.tag !== 'lab')).toBe(true)
    expect(slides.slice(roles.length).map((s) => s.kind)).toEqual(['slider', 'terminal'])
  })

  it('Built is reel, video projects, then swipe', () => {
    const { slides } = byId('built')
    expect(slides[0].kind).toBe('reel')
    expect(slides.at(-1)!.kind).toBe('swipe')
    const middle = slides.slice(1, -1)
    expect(middle.length).toBeGreaterThan(0)
    expect(middle.every((s) => s.kind === 'project' && !!s.video)).toBe(true)
  })

  it('every slide duration is within 3000-8000ms except finish, terminal and reel', () => {
    for (const s of groups.flatMap((g) => g.slides)) {
      expect(s.durationMs, s.key).toBeGreaterThanOrEqual(3000)
      if (s.kind === 'terminal') expect(s.durationMs, s.key).toBeLessThanOrEqual(14000)
      else if (s.kind === 'reel') expect(s.durationMs, s.key).toBe(s.items.length * s.stepMs)
      else if (s.kind !== 'finish') expect(s.durationMs, s.key).toBeLessThanOrEqual(8000)
    }
  })
})

describe('buildTour logId rules', () => {
  const groups = buildTour(input)
  const slides = groups.flatMap((g) => g.slides)

  it('lab role slides have no logId', () => {
    const labIds = timeline.filter((e) => e.tag === 'lab').map((e) => `now-role-${e.id}`)
    for (const s of slides.filter((x) => labIds.includes(x.key))) expect(s.logId, s.key).toBeUndefined()
  })

  it('non-lab role slides and project slides link to the log', () => {
    for (const s of slides) {
      if (s.kind === 'project') expect(s.logId, s.key).toBeTruthy()
      if (s.kind === 'role' && !s.key.endsWith('role-homelab')) {
        const e = timeline.find((x) => s.key.endsWith(`-role-${x.id}`))!
        expect(s.logId, s.key).toBe(e.tag === 'lab' ? undefined : e.id)
      }
    }
  })

  it('intro, quiz, number, poll, keys and finish slides have no logId', () => {
    for (const s of slides.filter((x) => ['intro', 'number', 'poll', 'keys', 'finish'].includes(x.kind))) {
      expect(s.logId, s.key).toBeUndefined()
    }
  })
})

describe('buildTour edge cases', () => {
  it('excludes drafts when includeDrafts is false and keeps them when true', () => {
    const entries = [entry({ id: 'a', end: null }), entry({ id: 'b', draft: true, start: '2022-01', end: null })]
    const off = small(entries).find((g) => g.id === 'now')!
    expect(off.slides.map((s) => s.key.replace(/^[\w]+-role-/, 'role-'))).toEqual(['role-a'])
    const on = small(entries, { includeDrafts: true }).find((g) => g.id === 'now')!
    expect(on.slides.map((s) => s.key.replace(/^[\w]+-role-/, 'role-'))).toEqual(['role-b', 'role-a'])
  })

  it('defaults includeDrafts from NODE_ENV', () => {
    const entries = [entry({ id: 'a', end: null }), entry({ id: 'b', draft: true, end: null })]
    const { includeDrafts: _omit, ...rest } = input
    const run = () => buildTour({ ...rest, timeline: entries, highlights: [], skills: [], copy: bareCopy })
    const prev = process.env.NODE_ENV
    try {
      ;(process.env as Record<string, string>).NODE_ENV = 'production'
      expect(run().find((g) => g.id === 'now')!.slides).toHaveLength(1)
      ;(process.env as Record<string, string>).NODE_ENV = 'development'
      expect(run().find((g) => g.id === 'now')!.slides).toHaveLength(2)
    } finally {
      ;(process.env as Record<string, string>).NODE_ENV = prev ?? 'test'
    }
  })

  it('drops groups with no slides', () => {
    const ids = small([entry({ id: 'a' })]).map((g) => g.id)
    expect(ids).not.toContain('now')
    expect(ids).not.toContain('proud')
    expect(ids).not.toContain('built')
    expect(ids).toEqual(expect.arrayContaining(['hi', 'career', 'toolbox', 'say-hi']))
  })

  it('drops a Proud of group when every highlight is quiz-revealed', () => {
    const e = entry({ id: 'q', story: { quiz: { ...quizBase, reveal: { value: 100000, suffix: '+' } } } })
    const groups = small([e], { highlights: [{ value: '100,000+', label: 'x', source: 's' }] })
    expect(groups.map((g) => g.id)).not.toContain('proud')
  })

  it('keeps a non-numeric highlight as a zero-value number slide', () => {
    const groups = small([entry({ id: 'a' })], { highlights: [{ value: 'Many', label: 'things', source: 's' }] })
    const s = groups.find((g) => g.id === 'proud')!.slides[0]
    expect(s).toMatchObject({ kind: 'number', value: 0, prefix: 'Many', suffix: '' })
  })

  it('project-lane entries are excluded from Career', () => {
    const groups = small([entry({ id: 'p', lane: 'project' }), entry({ id: 'w' })])
    expect(groups.find((g) => g.id === 'career')!.slides.map((s) => s.key.replace(/^[\w]+-role-/, 'role-'))).toEqual(['role-w'])
  })

  it('ongoing entries only appear in Now when end is null', () => {
    const groups = small([entry({ id: 'x', end: undefined }), entry({ id: 'y', end: null })])
    expect(groups.find((g) => g.id === 'now')!.slides.map((s) => s.key.replace(/^[\w]+-role-/, 'role-'))).toEqual(['role-y'])
  })
})

describe('slideDuration', () => {
  it('clamps to 3000 minimum', () => {
    expect(slideDuration('hi')).toBe(3000)
    expect(slideDuration('')).toBe(3000)
  })
  it('clamps to 8000 maximum', () => {
    expect(slideDuration(Array(100).fill('word').join(' '))).toBe(8000)
  })
  it('scales with word count and extra time', () => {
    expect(slideDuration('a b c d e f g h')).toBe(2200 + 8 * 260)
    expect(slideDuration('a b c d e f g h', 500)).toBe(2200 + 8 * 260 + 500)
  })
})

describe('parseHighlightValue', () => {
  it.each([
    ['100,000+', { prefix: '', value: 100000, suffix: '+' }],
    ['+150%', { prefix: '+', value: 150, suffix: '%' }],
    ['10+', { prefix: '', value: 10, suffix: '+' }],
  ])('parses %s', (raw, expected) => {
    expect(parseHighlightValue(raw)).toEqual(expected)
  })
  it('returns null without a number', () => {
    expect(parseHighlightValue('Many')).toBeNull()
    expect(parseHighlightValue('')).toBeNull()
  })
})

describe('isGroupNew', () => {
  const now = new Date(Date.UTC(2026, 10, 5))
  it('is true inside 90 days', () => {
    expect(isGroupNew({ updatedAt: '2026-10' }, now)).toBe(true)
    expect(isGroupNew({ updatedAt: '2026-09' }, now)).toBe(true)
  })
  it('is false outside 90 days', () => {
    expect(isGroupNew({ updatedAt: '2026-08' }, now)).toBe(false)
    expect(isGroupNew({ updatedAt: '2020-01' }, now)).toBe(false)
  })
  it('is false for a future month or no date', () => {
    expect(isGroupNew({ updatedAt: '2026-12' }, now)).toBe(false)
    expect(isGroupNew({}, now)).toBe(false)
  })
})

describe('buildTour keys', () => {
  it('gives every slide a key that is unique across the whole tour', async () => {
    const { buildTour } = await import('@/lib/tour/build-tour')
    const about = (await import('@/content/about')).default
    const groups = buildTour({
      about,
      timeline: (await import('@/content/timeline')).default,
      highlights: (await import('@/content/highlights')).default,
      skills: (await import('@/content/skills')).default,
      copy: (await import('@/content/tour')).default,
      includeDrafts: true,
    })
    const keys = groups.flatMap((g) => g.slides.map((s) => s.key))
    expect(new Set(keys).size).toBe(keys.length)
  })
})

const img = (id: string) => ({ src: `/${id}.png`, width: 800, height: 500, alt: `${id} screenshot` })
const featuredEntry = (id: string, start: string, over: Partial<TimelineEntry> = {}) =>
  entry({ id, lane: 'project', start, featured: { images: [img(id), img(`${id}-2`)] }, ...over })
const sliderStory = { question: 'Cool?', emoji: '🤯', heading: 'Same.', caption: 'So I built one.' }
const terminalCopy = {
  prompt: '$',
  lines: [
    { cmd: 'ls', out: 'a b' },
    { cmd: 'whoami', out: 'me' },
  ],
}
const groupOf = (groups: ReturnType<typeof buildTour>, id: string) => groups.find((g) => g.id === id)

describe('scratch slides', () => {
  const hl = [
    { value: '+150%', label: 'more sign-ups', source: 'Holler', reveal: 'scratch' as const },
    { value: '10+', label: 'mentored', source: 'Hub' },
    { value: '20+', label: 'counted', source: 'X', reveal: 'count' as const },
  ]

  it('only highlights marked scratch become scratch slides; the rest stay number', () => {
    const slides = groupOf(small([entry({ id: 'a' })], { highlights: hl }), 'proud')!.slides
    expect(slides.map((s) => s.kind)).toEqual(['scratch', 'number', 'number'])
    expect(slides[0]).toMatchObject({
      kind: 'scratch',
      heading: tourCopy.scratch.heading,
      value: '+150%',
      text: 'More sign-ups.',
      source: 'Holler',
    })
  })

  it('a quiz-revealed highlight is still skipped even when marked scratch', () => {
    const e = entry({ id: 'q', story: { quiz: { ...quizBase, reveal: { value: 150, suffix: '%' } } } })
    const slides = groupOf(small([e], { highlights: hl }), 'proud')!.slides
    expect(slides.map((s) => s.kind)).toEqual(['number', 'number'])
  })

  it('real content: +150% is the scratch card and comes first in Proud of', () => {
    const slides = groupOf(buildTour(input), 'proud')!.slides
    expect(slides.map((s) => s.kind)).toEqual(['scratch', 'number', 'number'])
    expect(slides[0].kind === 'scratch' && slides[0].value).toBe('+150%')
  })
})

describe('Now: slider and terminal', () => {
  const work = entry({ id: 'job', end: null })
  const labSlider = entry({ id: 'llm', tag: 'lab', start: '2026-10', end: null, story: { slider: sliderStory } })
  const labPlain = entry({ id: 'hl', tag: 'lab', start: '2026-10', end: null })

  it('orders ongoing roles, then the slider, then the terminal, dropping lab role slides', () => {
    const slides = groupOf(small([labPlain, work, labSlider], { copy: { ...tourCopy, terminal: terminalCopy } }), 'now')!
      .slides
    expect(slides.map((s) => s.key)).toEqual(['now-role-job', 'now-slider-llm', 'now-terminal'])
    expect(slides[1]).toMatchObject({ kind: 'slider', ...sliderStory, tone: 'work' })
    expect(slides[2]).toMatchObject({ kind: 'terminal', prompt: '$', lines: terminalCopy.lines })
  })

  it('without terminal copy, lab role slides come back but the slider entry has no role slide', () => {
    const slides = groupOf(small([labPlain, work, labSlider]), 'now')!.slides
    expect(slides.map((s) => s.key)).toEqual(['now-role-job', 'now-slider-llm', 'now-role-hl'])
    expect(slides[2]).toMatchObject({ kind: 'role', label: 'Tinkering' })
  })

  it('empty terminal lines behave like missing terminal copy', () => {
    const copy = { ...tourCopy, terminal: { prompt: '$', lines: [] } }
    const slides = groupOf(small([labPlain, work], { copy }), 'now')!.slides
    expect(slides.map((s) => s.key)).toEqual(['now-role-job', 'now-role-hl'])
  })

  it('a drafted slider entry is excluded in production', () => {
    const draft = { ...labSlider, draft: true }
    const slides = groupOf(small([work, draft]), 'now')!.slides
    expect(slides.map((s) => s.kind)).toEqual(['role'])
  })

  it('terminal duration covers typing plus reading time and stays within 3000-14000ms', () => {
    const slides = groupOf(small([work], { copy: { ...tourCopy, terminal: terminalCopy } }), 'now')!.slides
    const term = slides.find((s) => s.kind === 'terminal')!
    const typing = terminalDelays(terminalCopy.lines).reduce((a, b) => a + b, 0)
    expect(term.durationMs).toBe(Math.max(3000, typing + 3500))
    const long = { prompt: '$', lines: Array.from({ length: 30 }, () => ({ cmd: 'x'.repeat(40), out: 'y' })) }
    const capped = groupOf(small([work], { copy: { ...tourCopy, terminal: long } }), 'now')!.slides.at(-1)!
    expect(capped.durationMs).toBe(14000)
  })
})

describe('Built: reel and swipe', () => {
  const entries = [
    featuredEntry('old', '2019-01'),
    featuredEntry('new', '2024-06'),
    featuredEntry('mid', '2022-03'),
    featuredEntry('secret', '2025-01', { draft: true }),
    entry({ id: 'plain', lane: 'project', start: '2023-01' }),
    entry({
      id: 'vid',
      lane: 'project',
      start: '2021-01',
      story: { video: { src: '/v.mp4', poster: '/v.jpg', width: 400, height: 800 } },
    }),
  ]

  it('reel and swipe use visible featured entries newest first and exclude drafts', () => {
    const slides = groupOf(small(entries), 'built')!.slides
    expect(slides.map((s) => s.kind)).toEqual(['reel', 'project', 'swipe'])
    const reel = slides[0]
    const swipe = slides[2]
    if (reel.kind !== 'reel' || swipe.kind !== 'swipe') throw new Error('unexpected kinds')
    expect(reel.items.map((i) => i.id)).toEqual(['new', 'mid', 'old'])
    expect(swipe.cards.map((c) => c.id)).toEqual(['new', 'mid', 'old'])
    expect(reel.items[0]).toEqual({ id: 'new', title: 'T new', text: 'plain text', image: img('new') })
  })

  it('includes drafts in the reel when includeDrafts is true', () => {
    const reel = groupOf(small(entries, { includeDrafts: true }), 'built')!.slides[0]
    expect(reel.kind === 'reel' && reel.items.map((i) => i.id)).toEqual(['secret', 'new', 'mid', 'old'])
  })

  it('keeps only video entries as project slides', () => {
    const projects = groupOf(small(entries), 'built')!.slides.filter((s) => s.kind === 'project')
    expect(projects.map((s) => s.key)).toEqual(['project-vid'])
  })

  it('reel duration is images x 3200ms', () => {
    const reel = groupOf(small(entries), 'built')!.slides[0]
    if (reel.kind !== 'reel') throw new Error('expected reel')
    expect(reel.stepMs).toBe(3200)
    expect(reel.durationMs).toBe(3 * 3200)
  })

  it('uses the story hook as card text when present', () => {
    const e = featuredEntry('h', '2020-01', { story: { hook: 'Hooky.' } })
    const reel = groupOf(small([e]), 'built')!.slides[0]
    expect(reel.kind === 'reel' && reel.items[0].text).toBe('Hooky.')
  })

  it('no featured images: no reel or swipe; video-only Built still renders', () => {
    const slides = groupOf(small([entries[5]]), 'built')!.slides
    expect(slides.map((s) => s.kind)).toEqual(['project'])
  })

  it('real content: reel has 4 images and excludes drafts', () => {
    const reel = groupOf(buildTour(input), 'built')!.slides[0]
    if (reel.kind !== 'reel') throw new Error('expected reel')
    const ids = reel.items.map((i) => i.id)
    expect(ids).toHaveLength(4)
    for (const id of ids) expect(timeline.find((e) => e.id === id)!.draft).toBeFalsy()
    const starts = ids.map((id) => timeline.find((e) => e.id === id)!.start)
    expect([...starts].sort().reverse()).toEqual(starts)
    expect(reel.durationMs).toBe(4 * 3200)
  })
})

describe('Career flip card', () => {
  const entries = [
    entry({ id: 'first', start: '2015-09', end: '2016-05', title: 'Intern', org: 'Acme' }),
    entry({ id: 'mid', start: '2019-01', end: '2020-01' }),
    entry({ id: 'lead', start: '2025-02', end: null, head: true, title: 'Lead', org: 'Venera' }),
    entry({ id: 'side', start: '2026-01', end: null }),
  ]
  const flipOf = (groups: ReturnType<typeof buildTour>) => {
    const s = groupOf(groups, 'career')!.slides.at(-1)!
    if (s.kind !== 'flip') throw new Error(`expected flip, got ${s.kind}`)
    return s
  }

  it('defaults to the oldest dated entry and the head ongoing work entry', () => {
    const flip = flipOf(small(entries))
    expect(flip.then).toEqual({ year: '2015', text: 'Intern · Acme' })
    expect(flip.now).toEqual({ year: '2025', text: 'Lead · Venera' })
    expect(flip).toMatchObject({ key: 'career-flip', hint: tourCopy.thenNow.hint })
  })

  it('falls back to the newest ongoing work entry without a head', () => {
    const flip = flipOf(small(entries.map((e) => ({ ...e, head: undefined }))))
    expect(flip.now.text).toBe('T side · O side')
  })

  it('honours thenId/nowId and text overrides', () => {
    const copy = { ...tourCopy, thenNow: { hint: 'h', thenId: 'mid', nowId: 'side', nowText: 'Custom now' } }
    const flip = flipOf(small(entries, { copy: { ...copy, terminal: undefined } }))
    expect(flip.then).toEqual({ year: '2019', text: 'T mid · O mid' })
    expect(flip.now).toEqual({ year: '2026', text: 'Custom now' })
  })

  it('unknown or drafted ids fall back to the defaults', () => {
    const withDraft = [...entries, entry({ id: 'hidden', start: '2010-01', draft: true })]
    const copy = { ...tourCopy, terminal: undefined, thenNow: { hint: 'h', thenId: 'nope', nowId: 'hidden' } }
    const flip = flipOf(small(withDraft, { copy }))
    expect(flip.then.text).toBe('Intern · Acme')
    expect(flip.now.text).toBe('Lead · Venera')
  })

  it('is omitted when then and now resolve to the same entry', () => {
    const groups = small([entry({ id: 'only', end: null })])
    expect(groupOf(groups, 'career')!.slides.map((s) => s.kind)).toEqual(['role'])
  })

  it('is omitted when there is no ongoing work entry', () => {
    const groups = small([entry({ id: 'a' }), entry({ id: 'b', start: '2018-01' })])
    expect(groupOf(groups, 'career')!.slides.every((s) => s.kind === 'role')).toBe(true)
  })

  it('stays within 6500-8000ms', () => {
    const flip = flipOf(small(entries))
    expect(flip.durationMs).toBeGreaterThanOrEqual(6500)
    expect(flip.durationMs).toBeLessThanOrEqual(8000)
  })
})

describe('new slide kinds: keys and durations', () => {
  it('real content with drafts has unique keys and every new kind present once', () => {
    const groups = buildTour({ ...input, includeDrafts: true })
    const slides = groups.flatMap((g) => g.slides)
    const keys = slides.map((s) => s.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const kind of ['scratch', 'slider', 'terminal', 'reel', 'swipe', 'flip']) {
      expect(slides.filter((s) => s.kind === kind), kind).toHaveLength(1)
    }
  })

  it('real content: Now is ongoing roles, slider, terminal; Built ends with swipe; Career ends with flip', () => {
    const groups = buildTour(input)
    expect(groupOf(groups, 'now')!.slides.map((s) => s.kind)).toEqual(['role', 'role', 'slider', 'terminal'])
    expect(groupOf(groups, 'built')!.slides.map((s) => s.kind)).toEqual(['reel', 'project', 'swipe'])
    expect(groupOf(groups, 'career')!.slides.at(-1)!.kind).toBe('flip')
  })

  it('new kinds stay within their duration bounds', () => {
    const slides = buildTour({ ...input, includeDrafts: true }).flatMap((g) => g.slides)
    for (const s of slides) {
      if (s.kind === 'terminal') {
        expect(s.durationMs).toBeGreaterThanOrEqual(3000)
        expect(s.durationMs).toBeLessThanOrEqual(14000)
      } else if (['scratch', 'slider', 'swipe', 'flip'].includes(s.kind)) {
        expect(s.durationMs, s.key).toBeGreaterThanOrEqual(3000)
        expect(s.durationMs, s.key).toBeLessThanOrEqual(8000)
      }
    }
  })
})

describe('terminalDelays', () => {
  const lines = [
    { cmd: 'ls', out: 'x' },
    { cmd: 'cat f', out: 'y' },
  ]

  it('has one frame per typed character plus one output frame per line', () => {
    expect(terminalDelays(lines)).toHaveLength(2 + 1 + 5 + 1)
    expect(terminalDelays([])).toEqual([])
  })

  it('is deterministic and positive', () => {
    const a = terminalDelays(lines)
    expect(terminalDelays(lines)).toEqual(a)
    expect(a.every((ms) => Number.isInteger(ms) && ms > 0)).toBe(true)
  })

  it('prints output after 250ms, keys take 55-105ms, and later lines start after a 450ms gap', () => {
    const d = terminalDelays(lines)
    expect(d[2]).toBe(250)
    expect(d[8]).toBe(250)
    for (const i of [0, 1, 4, 5, 6, 7]) {
      expect(d[i]).toBeGreaterThanOrEqual(55)
      expect(d[i]).toBeLessThanOrEqual(105)
    }
    expect(d[3]).toBeGreaterThanOrEqual(450 + 55)
    expect(d[3]).toBeLessThanOrEqual(450 + 105)
  })
})
