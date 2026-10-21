'use server'

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

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: validatedFields.data.email,
      subject: `[Portfolio Contact] ${validatedFields.data.subject}`,
      text: `Name: ${validatedFields.data.name}\nEmail: ${validatedFields.data.email}\nSubject: ${validatedFields.data.subject}\n\nMessage:\n${validatedFields.data.message}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #171717; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
          <h2 style="color: #0284c7; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-top: 0;">New Contact Form Message</h2>
          <p><strong>From:</strong> ${validatedFields.data.name} (&lt;<a href="mailto:${validatedFields.data.email}" style="color: #0284c7;">${validatedFields.data.email}</a>&gt;)</p>
          <p><strong>Subject:</strong> ${validatedFields.data.subject}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; white-space: pre-wrap; font-size: 14px;">${validatedFields.data.message}</div>
        </div>
      `,
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
