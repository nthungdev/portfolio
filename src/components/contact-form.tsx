'use client'

import { MutableRefObject, useActionState, useRef } from 'react'
import classNames from 'classnames'
import { IoCheckmarkSharp } from 'react-icons/io5'
import { sendContactForm } from '@/actions/email'
import fireConfetti from '@/utils/fireConfetti'
import { ContactFormState } from '@/utils/validation'

const errorClasses = 'text-red-500 text-sm mt-1'

function actionWithConfetti(
  elementRef: MutableRefObject<HTMLButtonElement | null>
) {
  return async function (prevState: ContactFormState, formData: FormData) {
    const result = await sendContactForm(prevState, formData)
    if (result.success && elementRef.current) {
      fireConfetti(elementRef.current)
    }
    return result
  }
}

export default function ContactForm() {
  const sendButtonRef = useRef<HTMLButtonElement | null>(null)
  const [state, action, isPending] = useActionState(
    actionWithConfetti(sendButtonRef),
    {
      success: false,
      fields: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
    }
  )

  const showSuccess = state.success && !isPending

  return (
    <form
      action={action}
      className="p-4 md:p-8 bg-bp-surface rounded mx-auto max-w-screen-lg grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8 shadow-md"
    >
      <div>
        <label htmlFor="name" className="mb-2 block">
          Your name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded border border-bp-line bg-bp-surface px-3 py-2 text-bp-ink"
          defaultValue={state.fields.name}
        />
        {state?.inputErrors?.name && (
          <p className={errorClasses}>{state.inputErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block">
          Your email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border border-bp-line bg-bp-surface px-3 py-2 text-bp-ink"
          defaultValue={state.fields.email}
        />
        {state?.inputErrors?.email && (
          <p className={errorClasses}>{state.inputErrors.email}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="subject" className="mb-2 block">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          placeholder="Let me know how I can help you"
          required
          className="w-full rounded border border-bp-line bg-bp-surface px-3 py-2 text-bp-ink"
          defaultValue={state.fields.subject}
        />
        {state?.inputErrors?.subject && (
          <p className={errorClasses}>{state.inputErrors.subject}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="message" className="mb-2 block">
          Your message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Your message..."
          rows={4}
          required
          className="w-full rounded border border-bp-line bg-bp-surface px-3 py-2 text-bp-ink"
          defaultValue={state.fields.message}
        />
        {state?.inputErrors?.message && (
          <p className={errorClasses}>{state.inputErrors.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <div className="flex flex-row justify-center">
          <button
            ref={sendButtonRef}
            type="submit"
            disabled={isPending}
            className="rounded bg-bp-btn px-5 py-2 font-mono text-bp-btn-fg disabled:opacity-60"
          >
            Send
          </button>
        </div>

        <div
          className={classNames(
            'mx-auto flex flex-row justify-center items-center gap-x-2 overflow-hidden transition-[height]',
            showSuccess ? 'h-8 mt-4' : 'h-0'
          )}
        >
          <div className="p-1 bg-green-500 rounded-full inline-block">
            <IoCheckmarkSharp className="size-4" />
          </div>
          <span className="text-green-500 font-semibold">Message sent!</span>
        </div>
      </div>
    </form>
  )
}
