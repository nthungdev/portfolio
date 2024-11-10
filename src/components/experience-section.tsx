'use client'

import { CustomFlowbiteTheme, theme, Timeline } from 'flowbite-react'
import { HiCalendar } from 'react-icons/hi'
import BaseSection from './base-section'
import SectionTitle from './section-title'
import Chips from './chips'

const content = {
  title: 'Experience',
  timeline: [
    {
      title: 'Research Assistant',
      company: 'SUNY Binghamton',
      url: '',
      date: 'May 2024 - Aug 2024',
      description: ``,
      techStack: [
        'Statistical Analysis',
        'Automation',
        'Code Opimization',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Crater',
      url: '',
      date: 'Jan 2023 - Jun 2023',
      description: ``,
      techStack: [
        'Frontend Development',
        'Backend Development',
        'API Development',
        'Authentication',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Holler',
      url: '',
      date: 'Jun 2021 - Dec 2022',
      description: '',
      techStack: [
        'Frontend Development',
        'Mobile Development',
      ],
    },
    {
      title: 'Mobile and Full Stack Developer',
      company: 'Ergon Training',
      url: '',
      date: 'Apr 2019 - Jun 2021',
      description: '',
      techStack: [
        'Full-stack Web Development',
        'Mobile Development',
        'Authentication',
        'Project Management',
        'User Experience',
      ],
    },
    {
      title: 'Software Engineer',
      company: 'Sovereign Hill Estate',
      url: '',
      date: 'Sep 2020 - May 2021',
      description: '',
      techStack: [
        'Full-stack Web Development',
        'Project Management',
        'User Experience',
      ],
    },
    {
      title: 'Co-Founder and Tech Lead',
      company: 'Coding Hub',
      url: '',
      date: 'Sep 2018 - May 2020',
      description: '',
      techStack: [
        'Full-stack Web Development',
        'Mobile Development',
        'Project Management',
        'Tech Lead',
      ],
    },
    {
      title: 'Software Engineer Intern',
      company: 'Copart',
      url: '',
      date: 'May 2019 - Aug 2019',
      description: '',
      techStack: [
        'Frontend Development',
      ],
    },
    {
      title: '.NET Developer Intern',
      company: 'ITD Group',
      url: '',
      date: 'May 2018 - Aug 2018',
      description: '',
      techStack: [
        'Windows App Development',
      ],
    },
  ],
}

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

      <div className='px-4 mt-8'>
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
