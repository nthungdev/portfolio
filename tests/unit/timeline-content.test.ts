import { describe, expect, it } from 'vitest'
import timeline from '@/content/timeline'
import about from '@/content/about'

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
})
