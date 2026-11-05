import { describe, expect, it } from 'vitest'
import timeline from '@/content/timeline'
import about from '@/content/about'
import tour from '@/content/tour'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { STORY_ICONS } from '@/lib/tour/icons'

const YM = /^\d{4}-(0[1-9]|1[0-2])$/

function strings(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') out.push(v)
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out))
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out))
  return out
}

describe('timeline content', () => {
  it('has unique ids', () => {
    const ids = timeline.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has valid YYYY-MM dates with start <= end', () => {
    for (const e of timeline) {
      expect(e.start, e.id).toMatch(YM)
      if (typeof e.end === 'string') {
        expect(e.end, e.id).toMatch(YM)
        expect(e.start <= e.end, `${e.id} start<=end`).toBe(true)
      }
    }
  })

  it('every entry has a non-empty plain sentence', () => {
    for (const e of timeline) expect(e.plain?.trim().length, e.id).toBeGreaterThan(0)
  })

  it('featured entries have images with dimensions and alt', () => {
    const featured = timeline.filter((e) => e.featured)
    expect(featured.map((e) => e.id).sort()).toEqual(['daminh', 'discord', 'shuttler', 'vnb'])
    for (const e of featured) {
      expect(e.featured!.images.length, e.id).toBeGreaterThan(0)
      for (const img of e.featured!.images) {
        expect(img.width, e.id).toBeGreaterThan(0)
        expect(img.height, e.id).toBeGreaterThan(0)
        expect(img.alt, e.id).toBeTruthy()
        expect(img.src, e.id).toMatch(/^\//)
      }
    }
  })

  it('contains no phone numbers or street addresses', () => {
    const all = [...strings(timeline), ...strings(about)].filter((s) => !/^https?:\/\//.test(s))
    const phone = /(\+?\d[\d\s().-]{8,}\d)/
    const street = /\b\d{1,5}\s+[A-Z][\w.]*\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Blvd|Boulevard)\b/i
    for (const s of all) {
      expect(s, s).not.toMatch(phone)
      expect(s, s).not.toMatch(street)
    }
  })

  it('every story.icon exists in STORY_ICONS', () => {
    for (const e of timeline) {
      if (e.story?.icon) expect(Object.keys(STORY_ICONS), e.id).toContain(e.story.icon)
    }
  })

  it('every quiz has a valid answer index and positive reveal value', () => {
    for (const e of timeline) {
      const quiz = e.story?.quiz
      if (!quiz) continue
      expect(Number.isInteger(quiz.answer), e.id).toBe(true)
      expect(quiz.answer, e.id).toBeGreaterThanOrEqual(0)
      expect(quiz.answer, e.id).toBeLessThan(quiz.options.length)
      expect(quiz.reveal.value, e.id).toBeGreaterThan(0)
    }
  })

  it('story video src and poster exist under public/', () => {
    for (const e of timeline) {
      const video = e.story?.video
      if (!video) continue
      for (const file of [video.src, video.poster]) {
        expect(file, e.id).toMatch(/^\//)
        expect(existsSync(join(process.cwd(), 'public', file)), `${e.id} ${file}`).toBe(true)
      }
    }
  })

  it('tour copy and quiz text carry no percentages or vote counts', () => {
    const quizText = timeline.flatMap((e) =>
      e.story?.quiz ? [e.story.quiz.question, ...e.story.quiz.options, e.story.quiz.caption] : []
    )
    for (const s of [...strings(tour), ...quizText]) {
      expect(s, s).not.toMatch(/%/)
      expect(s, s).not.toMatch(/\bvotes?\b/i)
      expect(s, s).not.toMatch(/\b\d+\s*(people|users|others)\s+(picked|chose|voted)/i)
    }
  })
})
