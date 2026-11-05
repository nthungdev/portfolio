'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { renderContactEmail } from '@/emails/contact-template'
import { createInMemoryRateLimiter } from '@/lib/rate-limit'
import { isTurnstileEnforced, verifyTurnstile } from '@/lib/turnstile'
import {
  CONTACT_LABELS,
  ContactFormSchema,
  ContactFormState,
  ContactLabel,
} from '@/utils/validation'

const limiter = createInMemoryRateLimiter(5, 60 * 60 * 1000)

const EMPTY_FIELDS: ContactFormState['fields'] = {
  name: '',
  email: '',
  subject: '',
  label: CONTACT_LABELS[0],
  message: '',
}

const field = (formData: FormData, key: string): string => {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function sendContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot: bots fill the hidden field; pretend it worked.
  if (field(formData, 'company') !== '') {
    return { success: true, fields: EMPTY_FIELDS }
  }

  const rawLabel = field(formData, 'label')
  const submittedFields: ContactFormState['fields'] = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    subject: field(formData, 'subject'),
    label: (CONTACT_LABELS as readonly string[]).includes(rawLabel)
      ? (rawLabel as ContactLabel)
      : undefined,
    message: field(formData, 'message'),
  }

  const validatedFields = ContactFormSchema.safeParse(submittedFields)
  if (!validatedFields.success) {
    return {
      inputErrors: validatedFields.error.flatten().fieldErrors,
      fields: submittedFields,
    }
  }

  // Right-most entry: Google's front end appends the real client IP; left entries are client-controlled.
  const ip =
    (await headers()).get('x-forwarded-for')?.split(',').at(-1)?.trim() || 'unknown'

  if (isTurnstileEnforced()) {
    const token = field(formData, 'cf-turnstile-response') || null
    const human = await verifyTurnstile(token, ip === 'unknown' ? null : ip)
    if (!human) {
      return {
        submitError:
          'Could not verify you are human. Wait for the check to finish, then send again, or email me directly.',
        fields: submittedFields,
      }
    }
  }

  const limit = await limiter.consume(ip)
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60))
    return {
      submitError: `Too many messages from your network. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}, or email me directly.`,
      fields: submittedFields,
    }
  }

  try {
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL
    const fromEmail =
      process.env.CONTACT_SENDER_EMAIL ||
      'Portfolio Contact <onboarding@resend.dev>'

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return {
        submitError:
          "Messages can't be sent right now. Email contact@hungnguyen.dev instead.",
        fields: submittedFields,
      }
    }
    const resend = new Resend(apiKey)

    if (!toEmail) {
      throw new Error('CONTACT_RECEIVER_EMAIL is not configured')
    }

    const { name, email, subject, label, message } = validatedFields.data
    const { html, text } = renderContactEmail({
      name,
      email,
      subject,
      label,
      message,
    })

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `[${label}] ${subject}`,
      text,
      html,
    })

    if (error) {
      console.error('Resend delivery error:', error.name)
      return {
        submitError:
          'The message could not be delivered. Try again in a moment, or email me directly.',
        fields: submittedFields,
      }
    }

    return { success: true, fields: EMPTY_FIELDS }
  } catch (error) {
    console.error(
      'sendContactForm exception:',
      error instanceof Error ? error.message : 'unknown'
    )
    return {
      submitError:
        'The message could not be sent. Try again in a moment, or email me directly.',
      fields: submittedFields,
    }
  }
}
