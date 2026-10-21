'use client'

import classNames from 'classnames'
import { motion } from 'framer-motion'
import expertise from '@/content/expertise'
import IDS from '@/constants/ids'
import BaseSection from '@/components/base-section'
import SectionTitle from '@/components/section-title'
import Chips from '@/components/chips'
import { useRef, useState } from 'react'

const content = expertise

export default function ExpertiseSection() {
  const gridRef = useRef<HTMLUListElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringGrid, setIsHoveringGrid] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLUListElement>) => {
    if (!gridRef.current) return
    const rect = gridRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <BaseSection id={IDS.expertiseSection}>
      <SectionTitle>{content.title}</SectionTitle>

      {/* Bento Grid: Core Architectural Domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {content.expertise.map(
          ({ icon: Icon, iconClasses, title, body, techStack }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-primary-500/40 backdrop-blur-sm transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden"
            >
              {/* Subtle Ambient Hover Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="p-3 w-fit rounded-xl bg-neutral-800/60 border border-neutral-700/50 text-primary-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Icon className={classNames('size-8', iconClasses)} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {title}
                </h3>
                <p className="text-neutral-300 text-base leading-relaxed">
                  {body}
                </p>
                <div className="pt-2">
                  <Chips chips={techStack.map((name) => ({ name }))} />
                </div>
              </div>
            </motion.div>
          )
        )}
      </div>

      {/* Favorite Technologies Section Header */}
      <div className="mt-24">
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          {content.favoriteTechnologies.title}
        </h3>
        <p className="text-neutral-400 mt-2 text-base">
          Core tools, languages, and frameworks powering production systems.
        </p>
      </div>

      {/* Interactive Spotlight Card Grid */}
      <div className="mt-10 relative">
        <ul
          ref={gridRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHoveringGrid(true)}
          onMouseLeave={() => setIsHoveringGrid(false)}
          className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 p-2 rounded-2xl"
        >
          {/* Dynamic Flashlight Radial Spotlight Overlay */}
          {isHoveringGrid && (
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
              style={{
                background: `radial-gradient(380px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.15), transparent 75%)`,
              }}
            />
          )}

          {content.favoriteTechnologies.technologies.map(
            ({ icon: Icon, name }, index) => (
              <motion.li
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="group relative flex flex-col items-center justify-center p-6 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/40"
              >
                <div className="space-y-3 flex flex-col items-center justify-center">
                  <Icon className="size-10 md:size-12 text-neutral-300 group-hover:text-primary-400 group-hover:scale-115 transition-all duration-300" />
                  <span className="text-xs md:text-sm font-medium text-neutral-400 group-hover:text-white transition-colors duration-200 text-center font-mono">
                    {name}
                  </span>
                </div>
              </motion.li>
            )
          )}
        </ul>
      </div>
    </BaseSection>
  )
}
