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
