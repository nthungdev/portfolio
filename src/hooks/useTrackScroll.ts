'use client'

import { useState } from 'react'

export default function useTrackScroll(checkScrollDelay = 1000) {
  const [isScrolling, setIsScrolling] = useState(false)
  const [to, setTo] = useState<NodeJS.Timeout>()

  function startTracking() {
    function checkScrollOffset() {
      console.log('checkScrollOffset', {
        window: window.scrollY,
        scrollOffset,
        to,
      })
      if (window.scrollY > scrollOffset) {
        scrollOffset = window.scrollY
        setIsScrolling(true)
        setTo(setTimeout(checkScrollOffset, checkScrollDelay))
      } else {
        setTo(undefined)
        setIsScrolling(false)
      }
    }

    let scrollOffset = window.scrollY

    clearTimeout(to)
    setIsScrolling(true)
    setTo(setTimeout(checkScrollOffset, checkScrollDelay))
  }

  return { startTracking, isScrolling }
}
