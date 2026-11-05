import type { StoryIcon } from '@/lib/timeline/types'

/** 24×24 single-stroke paths; each `M` segment is drawn in turn by the plotter animation. */
export const STORY_ICONS: Record<StoryIcon, string> = {
  phone: 'M8 2.5h8a1.8 1.8 0 0 1 1.8 1.8v15.4a1.8 1.8 0 0 1-1.8 1.8H8a1.8 1.8 0 0 1-1.8-1.8V4.3A1.8 1.8 0 0 1 8 2.5z M10.5 18.5h3 M10 5h4',
  cap: 'M2 9.5l10-5 10 5-10 5z M6 11.5v4.5c3.5 2.5 8.5 2.5 12 0v-4.5 M21.5 9.7v5.5',
  chat: 'M4 5h16v11H10l-5 4v-4H4z M8 9.5h8 M8 12.5h5',
  shop: 'M3.5 9l2-4.5h13l2 4.5 M3.5 9c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5c0 1.5 1.5 2.5 3 2.5s3-1 3-2.5c0 1.5 1.5 2.5 3 2.5s2.5-1 2.5-2.5 M5 11.5V20h14v-8.5 M10 20v-5h4v5',
  key: 'M8.5 15.5a4 4 0 1 1 3.6-5.7H21v3h-2v2.5h-2.5v-2.5h-4.4a4 4 0 0 1-3.6 2.7z',
  layout: 'M3 4h18v16H3z M3 9h18 M9 9v11 M12 13h6 M12 16h4',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c3.2 3 3.2 15 0 18 M12 3c-3.2 3-3.2 15 0 18',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3.5 20c0-3.6 2.5-5.5 5.5-5.5s5.5 1.9 5.5 5.5 M16.5 10.5a2.5 2.5 0 1 0 0-5 M16 14c2.8 0 4.5 1.8 4.5 5',
  chart: 'M4 4v16h16 M8 16v-4 M12 16V8 M16 16v-6 M7.5 9.5l4-3 4 2.5 4-4',
  home: 'M3 11.5l9-7.5 9 7.5 M5.5 9.5V20h13V9.5 M10 20v-5.5h4V20',
  board: 'M3 4h18v12H3z M8.5 20l3.5-4 3.5 4 M7 8h6 M7 11.5h9',
  ticket: 'M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z M14.5 7v10',
  camera: 'M3 8h4l2-3h6l2 3h4v11H3z M12 17a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6z',
  spark: 'M12 3v5 M12 16v5 M3 12h5 M16 12h5 M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3',
  wave: 'M7 11.5V6a1.5 1.5 0 0 1 3 0v5 M10 10V4.5a1.5 1.5 0 0 1 3 0V10 M13 10V5.5a1.5 1.5 0 0 1 3 0V12 M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-12.5 4.3L4 14.5a1.5 1.5 0 0 1 2.4-1.8L7 13.5',
}

/** Splits an icon into the sub-paths the plotter draws one after another. */
export const iconSegments = (icon: StoryIcon): string[] =>
  STORY_ICONS[icon].split(' M').map((seg, i) => (i === 0 ? seg : `M${seg}`))
