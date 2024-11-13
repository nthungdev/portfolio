'use client'

import confetti from 'canvas-confetti'

/**
 * Fire confetti from the element
 */
export default function fireConfetti(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2
  confetti({
    origin: {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    },
  })
}
