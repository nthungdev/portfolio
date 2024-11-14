'use client'

import { MutableRefObject, useActionState, useRef } from 'react'
import classNames from 'classnames'
import { Button, Label, Textarea, TextInput } from 'flowbite-react'
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
      className="p-4 md:p-8 bg-primary-950 rounded-lg mx-auto max-w-screen-lg grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8 shadow-md"
    >
      <div>
        <Label htmlFor="name" className="mb-2 block text-gray-50">
          Your name
        </Label>
        <TextInput
          id="name"
          name="name"
          type="text"
          required
          defaultValue={state.fields.name}
        />
        {state?.inputErrors?.name && (
          <p className={errorClasses}>{state.inputErrors.name}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="mb-2 block text-gray-50">
          Your email
        </Label>
        <TextInput
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state.fields.email}
        />
        {state?.inputErrors?.email && (
          <p className={errorClasses}>{state.inputErrors.email}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="subject" className="mb-2 block text-gray-50">
          Subject
        </Label>
        <TextInput
          id="subject"
          name="subject"
          placeholder="Let me know how I can help you"
          required
          defaultValue={state.fields.subject}
        />
        {state?.inputErrors?.subject && (
          <p className={errorClasses}>{state.inputErrors.subject}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="message" className="mb-2 block text-gray-50">
          Your message
        </Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Your message..."
          rows={4}
          className="min-h-40"
          required
          defaultValue={state.fields.message}
        />
        {state?.inputErrors?.message && (
          <p className={errorClasses}>{state.inputErrors.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <div className="flex flex-row justify-center">
          <Button ref={sendButtonRef} type="submit" disabled={isPending} color="blue">
            Send message
          </Button>
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
