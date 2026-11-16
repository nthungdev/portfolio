'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { copyText } from '@/components/contact/copy-text'
import IDS, { TOUR_OPEN_EVENT, type TourOpenDetail } from '@/constants/ids'
import about from '@/content/about'
import { THEME_STORAGE_KEY, type ThemeChoice } from '@/lib/theme'

interface Command {
  id: string
  label: string
  hint: string
  run: () => void | Promise<void>
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after the palette changes the theme so other theme UI can resync. */
  onThemeChange?: () => void
}

const THEME_CYCLE: ThemeChoice[] = ['system', 'light', 'dark']

function cycleTheme(): ThemeChoice {
  const root = document.documentElement
  const current: ThemeChoice = root.classList.contains('dark')
    ? 'dark'
    : root.classList.contains('light')
      ? 'light'
      : 'system'
  const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length]
  root.classList.remove('light', 'dark')
  if (next !== 'system') root.classList.add(next)
  try {
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // storage unavailable: the choice still applies for this page view
  }
  return next
}

export default function CommandPalette({
  open,
  onOpenChange,
  onThemeChange,
}: CommandPaletteProps) {
  const router = useRouter()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    setQuery('')
    setIndex(0)
    setNotice('')
    inputRef.current?.focus()
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) {
      const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0
      document.body.style.paddingRight = `${current + scrollbar}px`
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      returnFocus.current?.focus()
    }
  }, [open])

  const commands = useMemo<Command[]>(() => {
    const go = (hash: string) => () => {
      onOpenChange(false)
      router.push(`/#${hash}`)
    }
    const external = (url: string) => () => {
      onOpenChange(false)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    const github = about.socialLinks.find((l) => l.name === 'GitHub')?.url
    const linkedin = about.socialLinks.find((l) => l.name === 'LinkedIn')?.url
    const list: Command[] = [
      { id: 'log', label: 'Go to Log', hint: 'section', run: go(IDS.log) },
      { id: 'prs', label: 'Go to Pull requests', hint: 'section', run: go(IDS.pullRequests) },
      { id: 'deps', label: 'Go to Dependencies', hint: 'section', run: go(IDS.dependencies) },
      { id: 'contact', label: 'Go to Contact', hint: 'section', run: go(IDS.contact) },
      {
        id: 'resume',
        label: 'Open resume',
        hint: '/resume',
        run: () => {
          onOpenChange(false)
          router.push('/resume')
        },
      },
      {
        id: 'open-email',
        label: 'Open email',
        hint: 'mailto',
        run: () => {
          onOpenChange(false)
          window.location.href = `mailto:${about.email}?subject=Hello%20from%20hungnguyen.dev`
        },
      },
      {
        id: 'email',
        label: 'Copy email',
        hint: about.email,
        run: async () => {
          const ok = await copyText(about.email)
          setNotice(ok ? 'Email copied to clipboard' : 'Copy failed, select the email manually')
          if (ok) setTimeout(() => onOpenChange(false), 900)
        },
      },
    ]
    if (github) list.push({ id: 'github', label: 'Open GitHub', hint: 'external', run: external(github) })
    if (linkedin) list.push({ id: 'linkedin', label: 'Open LinkedIn', hint: 'external', run: external(linkedin) })
    list.push({
      id: 'tour',
      label: 'Take the tour',
      hint: 'story',
      run: () => {
        onOpenChange(false)
        window.dispatchEvent(
          new CustomEvent<TourOpenDetail>(TOUR_OPEN_EVENT, { detail: { group: 'hi' } }),
        )
      },
    })
    list.push({
      id: 'theme',
      label: 'Switch theme',
      hint: 'system / light / dark',
      run: () => {
        const next = cycleTheme()
        onThemeChange?.()
        setNotice(`Theme: ${next}`)
      },
    })
    return list
  }, [router, onOpenChange, onThemeChange])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands
  }, [commands, query])

  if (!open) return null

  const active = Math.min(index, Math.max(filtered.length - 1, 0))

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onOpenChange(false)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIndex(filtered.length ? (active + 1) % filtered.length : 0)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setIndex(filtered.length ? (active - 1 + filtered.length) % filtered.length : 0)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      void filtered[active]?.run()
    } else if (event.key === 'Tab') {
      // Focus trap: the input is the only tab stop inside the dialog.
      event.preventDefault()
      inputRef.current?.focus()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/60 px-4 pt-[15vh] backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="w-full max-w-lg overflow-hidden rounded border border-bp-line bg-bp-surface text-bp-ink shadow-2xl"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIndex(0)
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].id}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command…"
          name="cmdk-query"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          className="w-full border-b border-bp-line bg-transparent px-4 py-3 font-mono text-sm placeholder:text-bp-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-bp-accent"
        />
        <ul id={listId} role="listbox" aria-label="Commands" className="bp-scroll-compact max-h-72 overflow-y-auto p-1">
          {filtered.map((command, i) => (
            <li
              key={command.id}
              id={`${listId}-${command.id}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setIndex(i)}
              onClick={() => void command.run()}
              className="flex cursor-pointer items-center justify-between gap-4 rounded px-3 py-2 text-sm aria-selected:bg-bp-accent aria-selected:text-bp-bg"
            >
              <span>{command.label}</span>
              <span className="truncate font-mono text-xs opacity-75">{command.hint}</span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li role="presentation" className="px-3 py-2 text-sm text-bp-muted">
              No matching command
            </li>
          )}
        </ul>
        <div className="flex justify-between border-t border-bp-line px-4 py-2 font-mono text-xs text-bp-muted">
          <span>↑↓ navigate · Enter run · Esc close</span>
          <span role="status">{notice}</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
