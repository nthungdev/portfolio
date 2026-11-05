'use client'

import { useActionState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { sendContactForm } from '@/actions/email'
import IDS from '@/constants/ids'
import fireConfetti from '@/utils/fireConfetti'
import {
  CONTACT_LABELS,
  type ContactFormState,
  HONEYPOT_FIELD,
} from '@/utils/validation'

declare global {
  interface Window {
    turnstile?: { reset: () => void }
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const INITIAL_STATE: ContactFormState = {
  fields: {
    name: '',
    email: '',
    subject: '',
    label: CONTACT_LABELS[0],
    message: '',
  },
}

const inputClass =
  'w-full rounded border border-bp-line bg-bp-bg px-3 py-2 font-sans text-base normal-case tracking-normal text-bp-ink placeholder:text-bp-muted aria-[invalid=true]:border-bp-del focus-visible:outline-none focus-visible:border-bp-accent focus-visible:ring-2 focus-visible:ring-bp-accent'
const labelClass =
  'grid gap-1.5 font-mono text-xs font-medium uppercase tracking-wider text-bp-muted'

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null
  return (
    <p id={id} className="font-sans text-sm normal-case tracking-normal text-bp-del">
      {messages.join(' ')}
    </p>
  )
}

export default function IssueForm() {
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const [state, action, isPending] = useActionState(
    async (prev: ContactFormState, formData: FormData) => {
      const result = await sendContactForm(prev, formData)
      if (result.success && buttonRef.current) fireConfetti(buttonRef.current)
      return result
    },
    INITIAL_STATE
  )

  // Turnstile tokens are single-use, so every settled submission needs a fresh one.
  useEffect(() => {
    if (!isPending && state !== INITIAL_STATE) window.turnstile?.reset()
  }, [state, isPending])

  const errors = state.inputErrors
  const describe = (key: string, has: boolean) =>
    has ? `${key}-error` : undefined

  return (
    <form
      action={action}
      noValidate
      aria-busy={isPending}
      className="grid gap-5 rounded border border-bp-line bg-bp-surface p-4 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Name
          <input
            id={IDS.contactNameInput}
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={state.fields.name}
            aria-invalid={Boolean(errors?.name)}
            aria-describedby={describe('name', Boolean(errors?.name))}
            className={inputClass}
          />
          <FieldError id="name-error" messages={errors?.name} />
        </label>
        <label className={labelClass}>
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={state.fields.email}
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={describe('email', Boolean(errors?.email))}
            className={inputClass}
          />
          <FieldError id="email-error" messages={errors?.email} />
        </label>
      </div>

      <label className={labelClass}>
        Title
        <input
          name="subject"
          type="text"
          required
          maxLength={120}
          defaultValue={state.fields.subject}
          aria-invalid={Boolean(errors?.subject)}
          aria-describedby={describe('subject', Boolean(errors?.subject))}
          className={inputClass}
        />
        <FieldError id="subject-error" messages={errors?.subject} />
      </label>

      <fieldset
        className="grid gap-2 border-0 p-0"
        aria-describedby={describe('label', Boolean(errors?.label))}
      >
        <legend className="mb-1.5 font-mono text-xs font-medium uppercase tracking-wider text-bp-muted">
          Label
        </legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_LABELS.map((label) => (
            <label key={label} className="cursor-pointer">
              <input
                type="radio"
                name="label"
                value={label}
                defaultChecked={(state.fields.label ?? CONTACT_LABELS[0]) === label}
                className="peer sr-only"
              />
              <span className="inline-block rounded border border-bp-line px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-bp-muted transition-colors duration-150 hover:text-bp-ink peer-checked:border-bp-accent peer-checked:bg-bp-accent peer-checked:text-bp-bg peer-focus-visible:ring-2 peer-focus-visible:ring-bp-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bp-surface">
                {label}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="label-error" messages={errors?.label} />
      </fieldset>

      <label className={labelClass}>
        Message
        <textarea
          name="message"
          required
          rows={6}
          maxLength={5000}
          defaultValue={state.fields.message}
          aria-invalid={Boolean(errors?.message)}
          aria-describedby={describe('message', Boolean(errors?.message))}
          className={`${inputClass} resize-y`}
        />
        <FieldError id="message-error" messages={errors?.message} />
      </label>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="auto" />
        </>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          ref={buttonRef}
          type="submit"
          disabled={isPending}
          className="rounded bg-bp-btn px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-wide text-bp-btn-fg transition-opacity duration-150 hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bp-surface"
        >
          {isPending ? 'Sending…' : 'Submit new issue'}
        </button>

        <div role="status" aria-live="polite" className="text-sm">
          {isPending && <span className="text-bp-muted">Sending your message…</span>}
          {!isPending && state.success && (
            <span className="text-bp-add">Sent. Thanks, I will reply by email.</span>
          )}
        </div>
      </div>

      {!isPending && state.submitError && (
        <p role="alert" className="text-sm text-bp-del">
          {state.submitError}
        </p>
      )}
    </form>
  )
}
