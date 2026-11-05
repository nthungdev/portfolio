import { z } from 'zod'

export const CONTACT_LABELS = ['job opportunity', 'project', 'just saying hi'] as const
export type ContactLabel = (typeof CONTACT_LABELS)[number]

export const ContactFormSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be at most 100 characters' })
    .regex(/^[^\r\n]*$/, { message: 'Name must be a single line' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Enter a valid email address' }),
  subject: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(4, { message: 'Title must be at least 4 characters' })
    .max(120, { message: 'Title must be at most 120 characters' })
    .regex(/^[^\r\n]*$/, { message: 'Title must be a single line' }),
  label: z.enum(CONTACT_LABELS, { errorMap: () => ({ message: 'Pick a label' }) }),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(5000, { message: 'Message must be at most 5000 characters' }),
})

export type ContactFormState = {
  inputErrors?: {
    name?: string[]
    email?: string[]
    subject?: string[]
    label?: string[]
    message?: string[]
  }
  submitError?: string
  success?: boolean
  fields: {
    name: string
    email: string
    subject: string
    /** Optional so legacy callers without a label still typecheck. */
    label?: ContactLabel
    message: string
  }
}
