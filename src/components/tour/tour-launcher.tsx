'use client'

import './tour.css'
import Image from 'next/image'
import { useSeenGroups, openTour } from './tour-seen'

const AVATAR_ID = 'tour-launch-avatar'
const BUTTON_ID = 'tour-launch-button'

/** Portrait ring that opens the tour; turns grey once every group is watched. */
export function TourAvatar({ groupIds }: { groupIds: string[] }) {
  const seen = useSeenGroups()
  const allSeen = groupIds.length > 0 && groupIds.every((id) => seen.has(id))

  return (
    <button
      type="button"
      id={AVATAR_ID}
      onClick={() => openTour('hi', AVATAR_ID)}
      aria-label="Take the tour"
      className="tour-ring shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bp-accent"
      data-seen={allSeen}
      data-pulse={seen.size === 0}
      style={{ width: 56, height: 56 }}
    >
      <Image
        src="/me.jpg"
        alt=""
        width={50}
        height={50}
        className="h-full w-full rounded-full border-2 border-bp-bg object-cover"
      />
    </button>
  )
}

export function TourButton({ className }: { className: string }) {
  return (
    <button type="button" id={BUTTON_ID} onClick={() => openTour('hi', BUTTON_ID)} className={className}>
      Take the tour
    </button>
  )
}
