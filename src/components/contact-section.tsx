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
      <ScrollElement
        viewport={{ once: false, amount: 0.1, margin: '50px 0px 50px 0px' }}
      >
        <ContactForm />
      </ScrollElement>
    </BaseSection>
  )
}
