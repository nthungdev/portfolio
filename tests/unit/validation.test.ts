import { describe, expect, it } from 'vitest'
import { ContactFormSchema } from '@/utils/validation'

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello there',
  label: 'project',
  message: 'This is a long enough message.',
}

const errorsFor = (patch: Record<string, unknown>) => {
  const r = ContactFormSchema.safeParse({ ...valid, ...patch })
  return r.success ? null : Object.keys(r.error.flatten().fieldErrors)
}

describe('ContactFormSchema', () => {
  it('accepts valid input for every label', () => {
    for (const label of ['job opportunity', 'project', 'just saying hi']) {
      expect(ContactFormSchema.safeParse({ ...valid, label }).success).toBe(true)
    }
  })

  it.each([
    ['name too short', { name: 'A' }, 'name'],
    ['name with newline', { name: 'Ada\nBcc: x@y.z' }, 'name'],
    ['name too long', { name: 'a'.repeat(101) }, 'name'],
    ['bad email', { email: 'nope' }, 'email'],
    ['title too short', { subject: 'abc' }, 'subject'],
    ['title too long', { subject: 'a'.repeat(121) }, 'subject'],
    ['title newline', { subject: 'Hello\nBcc: x@y.z' }, 'subject'],
    ['title CR', { subject: 'Hello\rthere' }, 'subject'],
    ['bad label', { label: 'spam' }, 'label'],
    ['missing label', { label: undefined }, 'label'],
    ['message short', { message: 'too short' }, 'message'],
    ['message long', { message: 'a'.repeat(5001) }, 'message'],
  ])('rejects %s', (_n, patch, field) => {
    expect(errorsFor(patch)).toEqual([field])
  })

  it('accepts boundary lengths', () => {
    expect(
      ContactFormSchema.safeParse({
        name: 'ab',
        email: 'a@b.co',
        subject: 'a'.repeat(120),
        label: 'project',
        message: 'a'.repeat(5000),
      }).success
    ).toBe(true)
    expect(errorsFor({ subject: 'abcd', message: 'a'.repeat(10), name: 'a'.repeat(100) })).toBeNull()
  })

  it('trims whitespace before length checks', () => {
    expect(errorsFor({ name: ' a ' })).toEqual(['name'])
  })
})
