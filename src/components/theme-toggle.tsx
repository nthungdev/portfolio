'use client'

import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, type ThemeChoice } from '@/lib/theme'

const OPTIONS: ThemeChoice[] = ['system', 'light', 'dark']

function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  if (choice !== 'system') root.classList.add(choice)
  try {
    if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, choice)
  } catch {
    // storage unavailable: the choice still applies for this page view
  }
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState<ThemeChoice>('system')

  useEffect(() => {
    const root = document.documentElement
    setChoice(
      root.classList.contains('dark')
        ? 'dark'
        : root.classList.contains('light')
          ? 'light'
          : 'system'
    )
  }, [])

  return (
    <div
      role="group"
      aria-label="Color theme"
      className="inline-flex border border-bp-line rounded font-mono text-xs"
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={choice === option}
          onClick={() => {
            setChoice(option)
            applyTheme(option)
          }}
          className="px-2.5 py-1 uppercase tracking-wide text-bp-muted transition-colors duration-150 aria-pressed:bg-bp-accent aria-pressed:text-bp-bg hover:text-bp-ink"
        >
          {option}
        </button>
      ))}
    </div>
  )
}
