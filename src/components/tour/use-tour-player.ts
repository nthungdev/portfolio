'use client'

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { Slide, TourGroup } from '@/lib/tour/build-tour'
import { markGroupSeen } from './tour-seen'

const TURN_MS = 500
const COMMIT_DEG = 22
const EASE = 'cubic-bezier(.3,.7,.2,1)'

interface Options {
  groups: TourGroup[]
  startIndex: number
  reduce: boolean
  /** Extra reasons to hold the clock: opening morph, hint overlay, dragging the frame. */
  suspended: boolean
  onFinish: () => void
}

export interface TourPlayer {
  groupIndex: number
  /** Current slide index per group, so side faces show where each group stands. */
  slideIndexes: number[]
  group: TourGroup
  slide: Slide
  slideIndex: number
  answered: boolean
  paused: boolean
  turning: boolean
  manualPaused: boolean
  /** Half the frame width in px; the cube's faces sit this far from its centre. */
  half: number
  cubeRef: RefObject<HTMLDivElement>
  next: () => void
  prev: () => void
  turn: (dir: 1 | -1) => void
  dragCube: (angle: number) => number
  releaseCube: (angle: number) => void
  togglePause: () => void
  setHolding: (value: boolean) => void
  markAnswered: () => void
}

function applyCube(cube: HTMLDivElement | null, angle: number, transition: string): void {
  const frameWidth = cube?.parentElement?.clientWidth
  if (!cube || !frameWidth) return
  cube.style.transition = transition
  cube.style.transform = `translateZ(${-frameWidth / 2}px) rotateY(${angle}deg)`
}

/** Slide clock, group cube and seen-tracking for the stories tour. */
export function useTourPlayer({ groups, startIndex, reduce, suspended, onFinish }: Options): TourPlayer {
  const [groupIndex, setGroupIndex] = useState(startIndex)
  const [slideIndexes, setSlideIndexes] = useState<number[]>(() => groups.map(() => 0))
  const [answeredKey, setAnsweredKey] = useState<string | null>(null)
  const [manualPaused, setManualPaused] = useState(false)
  const [holding, setHolding] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [turning, setTurning] = useState(false)
  const [width, setWidth] = useState(0)
  const cubeRef = useRef<HTMLDivElement>(null)
  const turningRef = useRef(false)
  const turnTimer = useRef(0)

  const group = groups[groupIndex]
  const slideIndex = slideIndexes[groupIndex]
  const slide = group.slides[slideIndex]
  const lastGroup = groups.length - 1
  const lastSlide = group.slides.length - 1

  const setCube = (angle: number, transition: string) =>
    applyCube(cubeRef.current, angle, transition)

  useLayoutEffect(() => {
    const frame = cubeRef.current?.parentElement
    if (!frame) return
    const measure = () => setWidth(frame.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  // The cube lands back on the front face whenever the front group (or the frame size) changes.
  useLayoutEffect(() => {
    applyCube(cubeRef.current, 0, 'none')
  }, [groupIndex, width])

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  useEffect(() => () => window.clearTimeout(turnTimer.current), [])

  // Reduced motion never auto-advances, so reaching the last slide counts as watched.
  useEffect(() => {
    if (reduce && slideIndex === lastSlide) markGroupSeen(group.id)
  }, [reduce, slideIndex, lastSlide, group.id])

  useEffect(() => {
    if (slide.kind !== 'finish') return
    const timer = window.setTimeout(() => {
      if (!reduce) onFinish()
      markGroupSeen(group.id)
    }, 500)
    return () => window.clearTimeout(timer)
  }, [slide.key, slide.kind, group.id, reduce, onFinish])

  const turn = (dir: 1 | -1, fromAngle = 0) => {
    const target = groupIndex + dir
    if (turningRef.current || target < 0 || target > lastGroup) return
    if (reduce) {
      setGroupIndex(target)
      return
    }
    turningRef.current = true
    setTurning(true)
    setCube(fromAngle, 'none')
    cubeRef.current?.getBoundingClientRect()
    setCube(-90 * dir, `transform ${TURN_MS}ms ${EASE}`)
    turnTimer.current = window.setTimeout(() => {
      turningRef.current = false
      setTurning(false)
      setGroupIndex(target)
    }, TURN_MS + 10)
  }

  const step = (delta: number) =>
    setSlideIndexes((all) => all.map((value, i) => (i === groupIndex ? value + delta : value)))

  const next = () => {
    if (turningRef.current) return
    if (slideIndex < lastSlide) {
      step(1)
      return
    }
    markGroupSeen(group.id)
    turn(1)
  }

  const prev = () => {
    if (turningRef.current) return
    if (slideIndex > 0) step(-1)
    else turn(-1)
  }

  const dragCube = (angle: number) => {
    const min = groupIndex < lastGroup ? -90 : 0
    const max = groupIndex > 0 ? 90 : 0
    const clamped = Math.max(min, Math.min(max, angle))
    setCube(clamped, 'none')
    return clamped
  }

  const releaseCube = (angle: number) => {
    const canTurn = angle < 0 ? groupIndex < lastGroup : groupIndex > 0
    if (Math.abs(angle) > COMMIT_DEG && canTurn) turn(angle < 0 ? 1 : -1, angle)
    else setCube(0, `transform .35s ${EASE}`)
  }

  return {
    groupIndex,
    slideIndexes,
    group,
    slide,
    slideIndex,
    answered: answeredKey === slide.key,
    paused: manualPaused || holding || hidden || suspended || turning,
    turning,
    manualPaused,
    half: width / 2,
    cubeRef,
    next,
    prev,
    turn: (dir) => turn(dir),
    dragCube,
    releaseCube,
    togglePause: () => setManualPaused((value) => !value),
    setHolding,
    markAnswered: () => setAnsweredKey(slide.key),
  }
}
