'use server'

import { renderContactEmail } from '@/emails/contact-template'
import { ContactFormSchema, ContactFormState } from '@/utils/validation'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactForm(
  prevState: ContactFormState,
  formData: FormData
) {
  const submittedFields = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  }
  const validatedFields = ContactFormSchema.safeParse(submittedFields)

  if (!validatedFields.success) {
    console.log(
      'Validation failed',
      validatedFields.error.flatten().fieldErrors
    )
    return {
      inputErrors: validatedFields.error.flatten().fieldErrors,
      fields: submittedFields,
    }
  }

  try {
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL
    const fromEmail =
      process.env.CONTACT_SENDER_EMAIL || 'Portfolio Contact <onboarding@resend.dev>'

    if (!toEmail) {
      throw new Error('CONTACT_RECEIVER_EMAIL is not configured')
    }

    const { html, text } = renderContactEmail({
      name: validatedFields.data.name,
      email: validatedFields.data.email,
      subject: validatedFields.data.subject,
      message: validatedFields.data.message,
    })

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: validatedFields.data.email,
      subject: `[Portfolio Contact] ${validatedFields.data.subject}`,
      text,
      html,
    })

    if (error) {
      console.error('Resend delivery error:', error)
      return {
        submitError: 'An error occurred while sending the message',
        fields: submittedFields,
      }
    }

    return {
      success: true,
      fields: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
    }
  } catch (error) {
    console.error('sendContactForm exception:', { error })
    return {
      submitError: 'An error occurred while sending the message',
      fields: submittedFields,
    }
  }
}
