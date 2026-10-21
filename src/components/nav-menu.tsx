'use client'

import IDS from '@/constants/ids'
import useTrackScroll from '@/hooks/useTrackScroll'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const content = {
  items: [
    {
      label: 'Expertise',
      href: `#${IDS.expertiseSection}`,
      id: IDS.expertiseSection,
    },
    {
      label: 'Experience',
      href: `#${IDS.experienceSection}`,
      id: IDS.experienceSection,
    },
    {
      label: 'Projects',
      href: `#${IDS.projectsSection}`,
      id: IDS.projectsSection,
    },
  ],
}

const delta = 40
const scrollToOffset = 50

export default function NavMenu() {
  const { isScrolling, startTracking } = useTrackScroll()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hide, setHide] = useState(false)
  const [activeSection, setActiveSection] = useState(content.items[0].id)

  function scrollToSection(id: string) {
    const element = document.getElementById(id.slice(1))
    if (!element) return

    startTracking()
    setActiveSection(id.slice(1))
    window.scrollTo({
      top: element.offsetTop - scrollToOffset,
      behavior: 'smooth',
    })
  }

  // Auto-detect which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200

      // Hide / show navbar based on scroll direction
      if (window.scrollY > lastScrollY + delta && window.scrollY > 400) {
        if (!isScrolling) setHide(true)
        setLastScrollY(window.scrollY)
      } else if (window.scrollY < lastScrollY - delta) {
        setHide(false)
        setLastScrollY(window.scrollY)
      }

      // Determine active section
      for (let i = content.items.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(content.items[i].id)
        if (sectionEl && sectionEl.offsetTop <= scrollPos) {
          setActiveSection(content.items[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isScrolling])

  return (
    <nav
      className={classNames(
        'z-50 fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-md text-white rounded-full p-1.5 border border-neutral-800 shadow-xl shadow-black/40 transition-transform duration-300 ease-out',
        hide ? '-translate-y-24' : 'translate-y-0'
      )}
    >
      <ul className="flex flex-row gap-x-1 relative">
        {content.items.map((item) => {
          const isActive = activeSection === item.id
          return (
            <li key={item.id} className="relative">
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-primary-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <button
                className={classNames(
                  'relative z-10 block px-4 py-1.5 text-sm font-medium rounded-full transition-colors',
                  isActive ? 'text-white' : 'text-neutral-300 hover:text-white'
                )}
                onClick={() => scrollToSection(item.href)}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
