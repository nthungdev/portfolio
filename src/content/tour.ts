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
  finish: {
    heading: 'You watched the whole thing 🎉',
    text: 'Thanks for sticking around. Want to work together?',
  },
}

export default tour
