'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import expertise from '@/content/expertise'
import IDS from '@/constants/ids'
import ScrollElement from '@/components/scroll-element'
import BaseSection from '@/components/base-section'
import SectionTitle from '@/components/section-title'
import Chips from '@/components/chips'

const content = expertise

export default function ExpertiseSection() {
  return (
    <BaseSection id={IDS.expertiseSection}>
      <SectionTitle>{content.title}</SectionTitle>

      <ul className="gap-16 mt-10 grid md:grid-cols-2">
        {content.expertise.map(
          ({ icon: Icon, iconClasses, title, body, techStack }, index) => (
            <ScrollElement
              key={title}
              direction={index % 2 === 0 ? 'left' : 'right'}
            >
              <li className="space-y-6">
                <Icon className={classNames('size-12', iconClasses)} />
                <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>
                <p className="text-lg">{body}</p>
                <Chips chips={techStack.map((name) => ({ name }))} />
              </li>
            </ScrollElement>
          )
        )}
      </ul>

      <h2 className="mt-20 text-3xl md:text-4xl font-semibold">
        {content.favoriteTechnologies.title}
      </h2>
      <div className="mt-10 flex flex-row justify-start md:justify-start">
        <ul className="w-full aspect-square sm:w-auto sm:aspect-auto gap-4 md:gap-6 inline-grid grid-flow-row grid-cols-3 sm:flex flex-row flex-wrap overflow-hidden">
          {content.favoriteTechnologies.technologies.map(
            ({ icon: Icon, name }, index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, translateX: '-50px' }}
                whileInView={{
                  opacity: 1,
                  translateX: '0px',
                  transition: {
                    duration: 0.15,
                    delay: 0.2 + 0.05 * index,
                  },
                }}
              >
                <div className="group flex items-center justify-center p-0 sm:p-4 size-full sm:size-28 md:size-32 border space-y-2 bg-gray-900 hover:bg-gray-800 transition-colors">
                  <div className="space-y-2">
                    <Icon className="size-12 md:size-16 mx-auto group-hover:scale-125 transition-transform" />
                    <div className="text-center text-xs md:text-base">
                      {name}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </ul>
      </div>
    </BaseSection>
  )
}
