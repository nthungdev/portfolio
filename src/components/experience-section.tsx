'use client'

import { motion } from 'framer-motion'
import experience from '@/content/experience'
import IDS from '@/constants/ids'
import SectionTitle from '@/components/section-title'
import BaseSection from '@/components/base-section'
import Chips from '@/components/chips'
import Link from 'next/link'
import { IoOpenOutline } from 'react-icons/io5'

const content = experience

export default function ExperienceSection() {
  return (
    <BaseSection id={IDS.experienceSection}>
      <SectionTitle>{content.title}</SectionTitle>

      <div className="relative mt-16 max-w-4xl mx-auto">
        {/* Continuous Vertical Glowing Timeline Beam */}
        <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-gradient-to-b from-blue-500 via-primary-500 to-transparent opacity-40" />

        <div className="space-y-12">
          {content.timeline.map((item, index) => {
            const isEven = index % 2 === 0
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative flex flex-col md:flex-row items-start md:items-center group"
              >
                {/* Milestone Glowing Beacon Node */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary-400 group-hover:scale-125 transition-transform duration-300 ring-4 ring-neutral-950 shadow-md shadow-primary-500/50" />
                </div>

                {/* Date Display (Left on desktop for even, Right on desktop for odd) */}
                <div
                  className={`pl-10 md:pl-0 w-full md:w-1/2 ${
                    isEven
                      ? 'md:pr-12 md:text-right md:order-1'
                      : 'md:pl-12 md:text-left md:order-2'
                  }`}
                >
                  <span className="inline-block px-3 py-1 text-xs font-mono font-medium rounded-full bg-neutral-900/90 text-primary-300 border border-neutral-800 shadow-sm">
                    {item.date}
                  </span>
                </div>

                {/* Experience Card */}
                <div
                  className={`pl-10 md:pl-0 w-full md:w-1/2 mt-3 md:mt-0 ${
                    isEven
                      ? 'md:pl-12 md:text-left md:order-2'
                      : 'md:pr-12 md:text-left md:order-1'
                  }`}
                >
                  <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800/90 hover:border-primary-500/40 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/30 group-hover:-translate-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      {item.url && (
                        <Link
                          href={item.url}
                          target="_blank"
                          className="text-neutral-400 hover:text-primary-400 transition-colors"
                          aria-label={`Visit ${item.company}`}
                        >
                          <IoOpenOutline className="size-4" />
                        </Link>
                      )}
                    </div>

                    <p className="text-sm font-medium text-primary-400 mt-1">
                      {item.company}
                    </p>

                    {item.description && (
                      <p className="text-sm text-neutral-300 mt-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    <div className="pt-4">
                      <Chips
                        chips={item.techStack.map((name) => ({
                          name,
                          colorClasses:
                            'bg-neutral-800 text-neutral-300 border border-neutral-700/60',
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </BaseSection>
  )
}
