import contact from '@/content/contact'
import BaseSection from './base-section'
import ContactForm from './contact-form'
import SectionTitle from './section-title'

const content = contact

export default function ContactSection() {
  return (
    <BaseSection>
      <SectionTitle>{content.title}</SectionTitle>
      <ContactForm />
    </BaseSection>
  )
}
