'use client'

import { sendContactForm } from '@/actions/email'
import { Button, Label, Textarea, TextInput } from 'flowbite-react'
import { useActionState } from 'react'

const errorClasses = 'text-red-500 text-sm mt-1'

export default function ContactForm() {
  const [state, action, isPending] = useActionState(sendContactForm, {
    fields: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  return (
    <form
      action={action}
      className="p-4 md:p-8 bg-primary-950 rounded-lg mx-auto max-w-screen-sm grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-4 md:gap-y-8"
    >
      <div>
        <Label htmlFor="name" className="mb-2 block text-gray-50">
          Your name
        </Label>
        <TextInput
          id="name"
          name="name"
          type="text"
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

      <div className="md:col-span-2 flex flex-row justify-center">
        <Button type="submit" className="" disabled={isPending}>
          Send message
        </Button>
      </div>
    </form>
  )
}

