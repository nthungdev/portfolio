import { PlotterHero } from '@/components/hero/plotter-hero'
import { HighlightsStrip } from '@/components/highlights-strip'
import { TimelineSection } from '@/components/timeline-section'
import { PullRequests } from '@/components/pull-requests/pull-requests'
import Dependencies from '@/components/dependencies/dependencies'
import ContactSection from '@/components/contact/contact-section'
import { TourDialog } from '@/components/tour/tour-dialog'
import about from '@/content/about'
import highlights from '@/content/highlights'
import skills from '@/content/skills'
import timeline from '@/content/timeline'
import tour from '@/content/tour'
import { buildTour } from '@/lib/tour/build-tour'

export default function Home() {
  const groups = buildTour({
    about,
    timeline,
    highlights,
    skills,
    copy: tour,
    portrait: '/me.jpg',
  })

  return (
    <main id="main">
      <PlotterHero tourGroupIds={groups.map((g) => g.id)} />
      <HighlightsStrip />
      <TimelineSection />
      <PullRequests />
      <Dependencies />
      <ContactSection />
      <TourDialog groups={groups} />
    </main>
  )
}
