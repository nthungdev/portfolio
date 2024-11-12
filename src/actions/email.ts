'use server'

import { ContactFormSchema, ContactFormState } from '@/utils/validation'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

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
    const msg = {
      to: process.env.CONTACT_RECEIVER_EMAIL!,
      from: process.env.CONTACT_SENDER_EMAIL!, // verified sender
      templateId: process.env.CONTACT_TEMPLATE_ID!,
      dynamicTemplateData: {
        visitorName: validatedFields.data.name,
        visitorEmail: validatedFields.data.email,
        visitorMessageSubject: validatedFields.data.subject,
        visitorMessage: validatedFields.data.message,
      },
    }

    const [response] = await sgMail.send(msg)
    console.log(response.statusCode)
    return {
      fields: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
    }
  } catch (error) {
    console.error({ error })
    return {
      submitError: 'An error occurred while sending the message',
      fields: submittedFields,
    }
  }
}
