'use client'

import './tour.css'
import { FOCUS_RING } from '@/components/log/lanes'
import type { TourGroupId } from '@/lib/tour/build-tour'
import { openTour, useSeenGroups } from './tour-seen'

export interface TourGroupSummary {
  id: TourGroupId
  name: string
  badge: string
  isNew: boolean
}

export const ringOriginId = (id: string) => `tour-ring-${id}`

export function TourRings({ groups }: { groups: TourGroupSummary[] }) {
  const seen = useSeenGroups()
  const watched = groups.filter((g) => seen.has(g.id)).length

  return (
    <div className="mb-4 grid gap-2 rounded border border-bp-line bg-bp-surface p-3">
      <div className="flex justify-between gap-3 font-mono text-xs text-bp-muted">
        <span>Take the tour</span>
        <span>
          {watched} of {groups.length} watched
        </span>
      </div>
      <ul className="tour-rings-row flex gap-3 overflow-x-auto p-1">
        {groups.map((group) => {
          const isSeen = seen.has(group.id)
          const isNew = group.isNew && !isSeen
          return (
            <li key={group.id} className="shrink-0">
              <button
                type="button"
                id={ringOriginId(group.id)}
                onClick={() => openTour(group.id, ringOriginId(group.id))}
                aria-label={`${group.name} story${isNew ? ', new' : ''}${isSeen ? ', watched' : ''}`}
                className={`relative grid justify-items-center gap-1 rounded font-mono text-[10.5px] text-bp-ink ${FOCUS_RING}`}
              >
                <span className="tour-ring" data-seen={isSeen} aria-hidden="true">
                  <i>{group.badge}</i>
                </span>
                <span aria-hidden="true">{group.name}</span>
                {isNew && (
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-0 rounded-full bg-[#c9301f] px-1 font-mono text-[8.5px] font-bold leading-4 text-white"
                  >
                    NEW
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
