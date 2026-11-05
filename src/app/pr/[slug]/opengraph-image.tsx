import { ImageResponse } from 'next/og'
import { OgFrame } from '@/components/pull-requests/og-frame'
import { getFeaturedEntry } from '@/components/pull-requests/featured'

export const alt = 'Pull request case study by Hung Nguyen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = getFeaturedEntry(slug)

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Pull request · merged"
        title={entry?.title ?? 'Hung Nguyen'}
        subtitle={entry?.plain ?? 'Case study'}
      />
    ),
    size
  )
}
