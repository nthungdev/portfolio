'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import IDS from '@/constants/ids'
import CommandPalette from './command-palette'
import ThemeToggle from './theme-toggle'

const LINKS = [
  { label: 'Log', hash: IDS.log },
  { label: 'Pull requests', hash: IDS.pullRequests },
  { label: 'Stack', hash: IDS.dependencies },
  { label: 'Contact', hash: IDS.contact },
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bp-accent'

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [themeKey, setThemeKey] = useState(0)
  const [shortcut, setShortcut] = useState('⌘K')

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut('Ctrl K')
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-bp-line bg-bp-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-8">
        <Link
          href={`/#${IDS.hero}`}
          aria-label="Hung Nguyen, back to top"
          className={`rounded border border-bp-line px-2.5 py-1 font-display text-sm font-bold tracking-wider transition-colors duration-150 hover:border-bp-accent ${focusRing}`}
        >
          HN
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.hash}
              href={`/#${link.hash}`}
              className={`rounded font-mono text-sm text-bp-muted transition-colors duration-150 hover:text-bp-ink ${focusRing}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label="Open command menu"
            onClick={() => setOpen(true)}
            className={`flex items-center gap-2 rounded border border-bp-line px-2.5 py-1 font-mono text-xs text-bp-muted transition-colors duration-150 hover:border-bp-accent hover:text-bp-ink ${focusRing}`}
          >
            <span className="md:hidden">Menu</span>
            <kbd className="hidden font-mono md:inline">{shortcut}</kbd>
          </button>
          <ThemeToggle key={themeKey} />
        </div>
      </div>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        onThemeChange={() => setThemeKey((k) => k + 1)}
      />
    </header>
  )
}
