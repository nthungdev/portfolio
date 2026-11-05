export const YEAR_MIN = 2016
export const YEAR_MAX = 2026.9
/** Right edge of the ruler; one year past the last labelled tick. */
export const RULER_END = 2027
export const YEAR_STEP = 0.1

export interface ScrubEntry {
  id: string
  org: string
  title: string
  plain: string
}

export interface ScrubData {
  entries: ScrubEntry[]
  /** Entry index for each slider step from YEAR_MIN; -1 before the first entry. */
  steps: number[]
}

export const stepIndex = (year: number): number =>
  Math.round((year - YEAR_MIN) / YEAR_STEP)
