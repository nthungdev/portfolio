'use client'

import IDS from '@/constants/ids'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

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
const scrollToOffset = 60

export default function NavMenu() {
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hide, setHide] = useState(false)
  const [activeSection, setActiveSection] = useState(content.items[0].id)

  // Prevents auto-scroll detection from overriding and jittering the active pill
  // during programmatic smooth scroll
  const isManualScroll = useRef(false)
  const manualScrollTimer = useRef<NodeJS.Timeout | null>(null)

  function scrollToSection(id: string) {
    const targetId = id.slice(1)
    const element = document.getElementById(targetId)
    if (!element) return

    // Immediately lock active state to target menu
    setActiveSection(targetId)
    isManualScroll.current = true
    setHide(false)

    if (manualScrollTimer.current) {
      clearTimeout(manualScrollTimer.current)
    }

    // Release lock after smooth scroll completes
    manualScrollTimer.current = setTimeout(() => {
      isManualScroll.current = false
    }, 850)

    window.scrollTo({
      top: element.offsetTop - scrollToOffset,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const handleScrollEnd = () => {
      if (isManualScroll.current) {
        if (manualScrollTimer.current) {
          clearTimeout(manualScrollTimer.current)
        }
        // Small settle buffer before re-enabling scroll detection
        manualScrollTimer.current = setTimeout(() => {
          isManualScroll.current = false
        }, 100)
      }
    }

    const handleScroll = () => {
      // Ignore scroll events during programmatic navigation
      if (isManualScroll.current) return

      const currentScrollY = window.scrollY

      // Hide / show navbar based on scroll direction
      if (currentScrollY > lastScrollY + delta && currentScrollY > 400) {
        setHide(true)
        setLastScrollY(currentScrollY)
      } else if (currentScrollY < lastScrollY - delta) {
        setHide(false)
        setLastScrollY(currentScrollY)
      }

      // Determine active section based on current viewport
      const scrollPos = currentScrollY + 220
      for (let i = content.items.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(content.items[i].id)
        if (sectionEl && sectionEl.offsetTop <= scrollPos) {
          setActiveSection(content.items[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scrollend', handleScrollEnd, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scrollend', handleScrollEnd)
      if (manualScrollTimer.current) {
        clearTimeout(manualScrollTimer.current)
      }
    }
  }, [lastScrollY])

  return (
    <nav
      className={classNames(
        'z-50 fixed top-4 left-1/2 -translate-x-1/2 bg-neutral-900/85 backdrop-blur-md text-white rounded-full p-1.5 border border-neutral-800 shadow-xl shadow-black/40 transition-transform duration-300 ease-out',
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
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}
              <button
                type="button"
                className={classNames(
                  'relative z-10 block px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150',
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
