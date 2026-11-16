import type { StoryIcon } from '@/lib/timeline/types'

/** Copy for the stories tour that does not come from the timeline, highlights or skills. */
const tour = {
  intro: {
    text: 'I build web and mobile apps people actually use.',
    icon: 'wave' as StoryIcon,
  },
  poll: {
    question: 'Flutter or React Native?',
    options: ['Flutter', 'React Native'],
    caption: 'Both are in my toolbox. Flutter powered the 100,000-user app at Holler.',
  },
  /** Heading over highlights marked `reveal: 'scratch'`. */
  scratch: {
    heading: 'Scratch to see what one feature did',
  },
  /** Typed out at the end of Now; remove `lines` to drop the slide. */
  terminal: {
    prompt: 'hung@home ~ $',
    lines: [
      { cmd: 'whoami', out: 'Hung Nguyen · Lead Software Engineer @ Venera AI · New York' },
      { cmd: 'ls ~/side-projects', out: 'homelab/  hermes/  graphrag/  gomoku/  ygo-companion/' },
      { cmd: 'cat hermes/README', out: 'A private AI assistant I can message like a friend, on Signal and Discord.' },
      { cmd: 'uptime ygo-companion', out: 'up since 2020, still maintained' },
    ],
  },
  /**
   * Then/now flip card closing Career. Entries default to the oldest dated entry and the
   * current lead role; set `thenId`/`nowId` or `thenText`/`nowText` to override.
   */
  thenNow: {
    hint: 'Tap to flip',
  },
  finish: {
    heading: 'You watched the whole thing 🎉',
    text: 'Thanks for sticking around. Want to work together?',
  },
}

export default tour
