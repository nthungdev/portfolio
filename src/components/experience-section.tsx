'use client'

import { CustomFlowbiteTheme, theme, Timeline } from 'flowbite-react'
import { HiCalendar } from 'react-icons/hi'
import BaseSection from './base-section'
import SectionTitle from './section-title'
import Chips from './chips'
import experience from '@/app/content/experience'

const content = experience

export default function ExperienceSection() {
  const customTimelineTheme: CustomFlowbiteTheme['timeline'] = {
    ...theme.timeline,
    item: {
      ...theme.timeline.item,
      point: {
        ...theme.timeline.item.point,
        marker: {
          ...theme.timeline.item.point.marker,
          icon: {
            ...theme.timeline.item.point.marker.icon,
            wrapper:
              'absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-200',
          },
        },
      },
    },
  }

  return (
    <BaseSection>
      <SectionTitle>{content.title}</SectionTitle>

      <div className="px-4 mt-8">
        <Timeline theme={customTimelineTheme}>
          {content.timeline.map((item, index) => (
            <Timeline.Item key={index}>
              <Timeline.Point icon={HiCalendar} />
              <Timeline.Content>
                <Timeline.Time>{item.date}</Timeline.Time>
                <Timeline.Title className="text-gray-50">
                  {item.title}
                </Timeline.Title>
                <Timeline.Body className="text-gray-300">
                  {item.company}
                </Timeline.Body>
                <Timeline.Body className="text-gray-100">
                  {/* {item.description} */}
                  <Chips chips={item.techStack.map((name) => ({ name }))} />
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </BaseSection>
  )
}
