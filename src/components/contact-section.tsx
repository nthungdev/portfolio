import contact from '@/content/contact'
import BaseSection from './base-section'
import ContactForm from './contact-form'
import SectionTitle from './section-title'
import ScrollElement from './scroll-element'

const content = contact

export default function ContactSection() {
  return (
    <BaseSection>
      <SectionTitle center>{content.title}</SectionTitle>
      <ScrollElement>
        <ContactForm />
      </ScrollElement>
    </BaseSection>
  )
}
