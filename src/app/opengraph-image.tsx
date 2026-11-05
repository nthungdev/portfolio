import { ImageResponse } from 'next/og'
import about from '@/content/about'
import { OgFrame } from '@/components/pull-requests/og-frame'

export const alt = 'Hung Nguyen, Lead Software Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="nthungdev / portfolio"
        title={about.name}
        subtitle={`${about.title} at ${about.company}. Web, mobile and AI infrastructure.`}
      />
    ),
    size
  )
}
