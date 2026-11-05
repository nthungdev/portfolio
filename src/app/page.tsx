import { PlotterHero } from '@/components/hero/plotter-hero'
import { HighlightsStrip } from '@/components/highlights-strip'
import { TimelineSection } from '@/components/timeline-section'
import { PullRequests } from '@/components/pull-requests/pull-requests'
import Dependencies from '@/components/dependencies/dependencies'
import ContactSection from '@/components/contact/contact-section'

export default function Home() {
  return (
    <main id="main">
      <PlotterHero />
      <HighlightsStrip />
      <TimelineSection />
      <PullRequests />
      <Dependencies />
      <ContactSection />
    </main>
  )
}
