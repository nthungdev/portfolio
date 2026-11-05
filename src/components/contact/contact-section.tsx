import IDS from '@/constants/ids'
import about from '@/content/about'
import CopyEmail from './copy-email'
import IssueForm from './issue-form'

export default function ContactSection() {
  return (
    <section
      id={IDS.contact}
      aria-labelledby="contact-heading"
      className="scroll-mt-16 border-t border-bp-line px-4 py-16 sm:px-8 [background-image:linear-gradient(var(--bp-grid)_1px,transparent_1px),linear-gradient(90deg,var(--bp-grid)_1px,transparent_1px)] [background-size:24px_24px]"
    >
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-2">
          <p className="font-mono text-xs uppercase tracking-widest text-bp-muted">
            New issue
          </p>
          <h2
            id="contact-heading"
            className="font-display text-3xl font-bold uppercase tracking-wide"
          >
            Open an issue
          </h2>
          <p className="text-bp-muted">Goes straight to my inbox.</p>
        </header>
        <div className="max-w-3xl"><IssueForm /></div>
        <CopyEmail email={about.email} />
      </div>
    </section>
  )
}
