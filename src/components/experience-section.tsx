'use client'

import { CustomFlowbiteTheme, theme, Timeline } from 'flowbite-react'
import { HiCalendar } from 'react-icons/hi'
import { motion } from 'framer-motion'
import experience from '@/content/experience'
import IDS from '@/constants/ids'
import SectionTitle from '@/components/section-title'
import BaseSection from '@/components/base-section'
import Chips from '@/components/chips'

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
    <BaseSection id={IDS.experienceSection}>
      <SectionTitle>{content.title}</SectionTitle>

      <div className="px-4 mt-8">
        <Timeline theme={customTimelineTheme}>
          {content.timeline.map((item, index) => (
            <Timeline.Item key={index} className="pb-5">
              <Timeline.Point icon={HiCalendar} />
              <Timeline.Content>
                <Timeline.Time>{item.date}</Timeline.Time>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      delay: 0.2,
                    },
                  }}
                >
                  <Timeline.Title className="text-gray-50">
                    {item.title}
                  </Timeline.Title>
                  <Timeline.Body className="text-gray-300">
                    {item.company}
                  </Timeline.Body>
                  <Timeline.Body className="text-gray-100">
                    <Chips chips={item.techStack.map((name) => ({ name }))} />
                  </Timeline.Body>
                </motion.div>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </BaseSection>
  )
}
