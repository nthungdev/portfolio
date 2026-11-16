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

const small = (entries: TimelineEntry[], extra: Partial<TourInput> = {}) =>
  buildTour({ ...input, timeline: entries, highlights: [], skills: [], ...extra })

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

  it('Career opens with the quiz then 14 roles newest first', () => {
    const { slides } = byId('career')
    expect(slides[0].kind).toBe('quiz')
    const roles = slides.slice(1)
    expect(roles).toHaveLength(14)
    expect(roles.every((s) => s.kind === 'role')).toBe(true)
    const starts = roles.map((s) => timeline.find((e) => s.key.endsWith(`-role-${e.id}`))!.start)
    expect([...starts].sort().reverse()).toEqual(starts)
  })

  it('does not repeat the quiz-revealed highlight in Proud of', () => {
    const numbers = byId('proud').slides.flatMap((s) => (s.kind === 'number' ? [s.value] : []))
    expect(numbers).not.toContain(100000)
    expect(numbers).toHaveLength(highlights.length - 1)
  })

  it('Now holds ongoing entries then lab entries', () => {
    const { slides } = byId('now')
    const entries = slides.map((s) => timeline.find((e) => s.key.endsWith(`-role-${e.id}`))!)
    const ongoing = entries.filter((e) => e.tag !== 'lab')
    expect(ongoing.length).toBeGreaterThan(0)
    expect(ongoing.every((e) => e.end === null)).toBe(true)
    expect(entries.slice(0, ongoing.length).every((e) => e.tag !== 'lab')).toBe(true)
    expect(entries.slice(ongoing.length).every((e) => e.tag === 'lab')).toBe(true)
    expect(entries.length - ongoing.length).toBe(timeline.filter((e) => e.tag === 'lab').length)
  })

  it('Built puts video entries first', () => {
    const { slides } = byId('built')
    const firstNoVideo = slides.findIndex((s) => s.kind === 'project' && !s.video)
    const lastVideo = slides.map((s) => s.kind === 'project' && !!s.video).lastIndexOf(true)
    expect(lastVideo).toBeGreaterThanOrEqual(0)
    expect(firstNoVideo === -1 || lastVideo < firstNoVideo).toBe(true)
    expect(slides[0].kind === 'project' && slides[0].video).toBeTruthy()
  })

  it('every slide duration is within 3000-8000ms except the finish slide', () => {
    for (const s of groups.flatMap((g) => g.slides)) {
      expect(s.durationMs, s.key).toBeGreaterThanOrEqual(3000)
      if (s.kind !== 'finish') expect(s.durationMs, s.key).toBeLessThanOrEqual(8000)
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
    const run = () => buildTour({ ...rest, timeline: entries, highlights: [], skills: [] })
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
