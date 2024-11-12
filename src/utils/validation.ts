import { z } from 'zod'

export const ContactFormSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, { message: 'Name is required' })
    .trim(),
  email: z.string({ required_error: 'Email is required' }).email(),
  subject: z
    .string({ required_error: 'Subject is required' })
    .min(5, { message: 'Subject is too short' })
    .trim(),
  message: z
    .string({ required_error: 'Message is required' })
    .min(1, { message: 'Message is required' })
    .trim(),
})

export type ContactFormState = {
  inputErrors?: {
    name?: string[]
    email?: string[]
    subject?: string[]
    message?: string[]
  }
  submitError?: string
  success?: boolean
  fields: {
    name: string
    email: string
    subject: string
    message: string
  }
}
