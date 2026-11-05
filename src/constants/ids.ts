const IDS = {
  hero: 'hero',
  highlights: 'highlights',
  log: 'log',
  pullRequests: 'pull-requests',
  dependencies: 'dependencies',
  contact: 'contact',
  contactNameInput: 'contact-name',
  // Legacy section ids, removed once the old sections are deleted.
  experienceSection: 'experience-section',
  projectsSection: 'projects-section',
  contactSection: 'contact-section',
  aboutSection: 'about-section',
  landingSection: 'landing-section',
  expertiseSection: 'expertise-section',
} as const

/** Row anchor for a timeline entry, e.g. `c-venera`. */
export const commitAnchor = (id: string) => `c-${id}`

/** Window event that asks the log to reveal and expand one entry. */
export const TIMELINE_OPEN_EVENT = 'timeline:open'
export type TimelineOpenDetail = { id: string }

export default IDS

/** Window event that opens the stories tour, optionally at one group. */
export const TOUR_OPEN_EVENT = 'tour:open'
export type TourOpenDetail = { group?: string; originId?: string }

/** Window event that fills the contact form's subject and label, then focuses the message. */
export const CONTACT_PREFILL_EVENT = 'contact:prefill'
export type ContactPrefillDetail = { subject: string; label?: string }
