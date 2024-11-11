'use client'

import IDS from '@/constants/ids'
import useTrackScroll from '@/hooks/useTrackScroll'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

const content = {
  items: [
    {
      label: 'Expertise',
      href: `#${IDS.expertiseSection}`,
    },
    {
      label: 'Experience',
      href: `#${IDS.experienceSection}`,
    },
    {
      label: 'Projects',
      href: `#${IDS.projectsSection}`,
    },
    // {
    //   label: 'Contact',
    //   href: `#${IDS.contactSection}`,
    // },
  ],
}

const delta = 50
const scrollToOffset = 40

export default function NavMenu() {
  const { isScrolling, startTracking } = useTrackScroll()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [hide, setHide] = useState(false)

  function scrollToSection(id: string) {
    const element = document.getElementById(id.slice(1))
    if (!element) {
      console.error(`Element with id ${id} not found`)
      return
    }

    startTracking()
    console.log({ top: element.offsetTop })
    window.scrollTo({
      top: element.offsetTop - scrollToOffset,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      const landingHeight = document
        .getElementById(IDS.landingSection)
        ?.getBoundingClientRect().height
      if (!landingHeight) {
        console.error('Landing section not found')
        return
      }

      // do not hide if landing section is visible
      if (window.scrollY < landingHeight) {
        return
      }

      if (window.scrollY > lastScrollY + delta) {
        if (!isScrolling) {
          setHide(true)
        }
        setLastScrollY(window.scrollY)
      }

      if (window.scrollY < lastScrollY - delta) {
        setHide(false)
        setLastScrollY(window.scrollY)
      }
    }

    document.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [hide, lastScrollY, isScrolling])

  const shouldHide = hide

  return (
    <nav
      className={classNames(
        'z-10 fixed top-2 left-1/2 -translate-x-1/2 bg-black text-white rounded-full py-1.5 px-1.5 shadow-sm-light transition-transform shadow-slate-400 hover:scale-x-105 ease-out',
        shouldHide && '-translate-y-16',
        !shouldHide && 'translate-y-0'
      )}
    >
      <ul className="flex flex-row gap-x-1">
        {content.items.map((item, index) => (
          <li key={index}>
            <button
              className="group block px-3 py-1 text-white rounded-full hover:bg-primary-400 transition-colors"
              onClick={() => scrollToSection(item.href)}
            >
              <div className="group-hover:scale-110 transition-transform ease-out">
                {item.label}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
