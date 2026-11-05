import type { TimelineEntry } from '@/lib/timeline/types'

const gh = (path: string, label = 'GitHub') => ({
  label,
  href: `https://github.com/${path}`,
})

/**
 * The career log is generated from this list; no component changes are needed
 * to add, edit or remove an entry. Order here does not matter (rows sort by date).
 *
 * - `end` omitted        -> a single commit on main (projects, releases).
 * - `end: 'YYYY-MM'`     -> a branch: forks off main at `start`, merges back at `end`.
 * - `end: null`          -> an ongoing branch that stays open to the top.
 * - `tag: 'lab'`         -> listed under "Uncommitted changes" above the graph.
 * - `branch`             -> optional pill name (defaults to `id`).
 * - `head: true`         -> rings the pill and expands the row on load.
 * - `draft: true`        -> hidden in production builds.
 *
 * Columns and branch colours are assigned automatically.
 */
const timeline: TimelineEntry[] = [
  {
    id: 'homelab',
    lane: 'project',
    tag: 'lab',
    title: 'Self-hosted homelab',
    org: 'Synology NAS · Docker',
    start: '2026-10',
    diff: {
      add: [
        'Run my own services in Docker on a Synology NAS: password manager, manga server, agent runtime',
      ],
    },
    plain: 'I run my own private apps and servers at home instead of renting them.',
    stack: ['Docker', 'Synology'],
    links: [],
  },
  {
    id: 'hermes',
    lane: 'project',
    tag: 'lab',
    title: 'Personal AI assistant',
    org: 'Hermes Agent · Signal and Discord',
    start: '2026-10',
    diff: {
      add: ['Self-hosted AI assistant on Signal and Discord with custom tools'],
    },
    plain: 'I built a private AI assistant I can message like a friend.',
    stack: ['Hermes Agent', 'Signal', 'Discord'],
    links: [],
  },
  {
    id: 'llm',
    lane: 'project',
    tag: 'lab',
    title: 'Private LLM infrastructure',
    org: 'Modal · vLLM',
    start: '2026-10',
    diff: {
      add: [
        'Serverless vLLM cluster on Modal GPUs that scales to zero and keeps no request logs',
      ],
    },
    plain: 'I host my own AI model so my prompts stay private and cost nothing when idle.',
    stack: ['Modal', 'vLLM', 'Python'],
    links: [],
  },
  {
    id: 'graphrag',
    lane: 'project',
    tag: 'lab',
    title: 'Knowledge-graph search over my notes',
    org: 'Obsidian GraphRAG + kb-search CLI',
    start: '2026-10',
    diff: {
      add: [
        'Lets my AI agents search my own notes and docs before they ask me anything',
      ],
    },
    plain: 'My AI tools can look things up in my own notes before they bother me.',
    stack: ['Obsidian', 'GraphRAG', 'CLI'],
    links: [],
  },
  {
    id: 'crafinity',
    lane: 'work',
    title: 'Software Engineer',
    org: 'Crafinity',
    start: '2026-01',
    end: null,
    diff: {
      add: [
        'Build the listing-management system that syncs listings, prices and sales across the Shopify and Etsy storefronts',
        'Move order processing off Airtable and Apps Script onto a dedicated backend and database',
        'Ship product-personalization sync across sales platforms',
      ],
    },
    plain: 'I help a handmade-goods shop keep its Shopify and Etsy stores and orders in sync.',
    stack: ['Shopify', 'Etsy', 'Node.js', 'TypeScript', 'PostgreSQL'],
    links: [],
  },
  {
    id: 'venera',
    lane: 'work',
    title: 'Lead Software Engineer',
    org: 'Venera AI',
    start: '2025-02',
    end: null,
    head: true,
    diff: {
      add: [
        'Lead the web team building a health-focused AI chatbot web app and the company landing page',
        'Own delivery end to end: planning, code quality, CI/CD and releases',
        'Mentor engineers and turn product goals into technical plans',
      ],
    },
    plain: 'I lead the web team behind a health-focused AI chatbot.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'CI/CD'],
    links: [{ label: 'Venera AI', href: 'https://venerian.space' }],
  },
  {
    id: 'vnb',
    lane: 'project',
    title: 'Event Management System',
    org: 'vn-badminton-club',
    start: '2024-10',
    diff: {
      add: [
        'Organizers create and manage events; members browse, register and take part',
        'Next.js, TypeScript, Tailwind, Firebase',
      ],
    },
    plain: 'A website where a badminton club plans events and members sign up for them.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase'],
    links: [gh('nthungdev/vn-badminton-club')],
    featured: {
      images: [
        {
          src: '/projectImgs/vnbadminton.png',
          width: 1344,
          height: 830,
          alt: 'Event Management System: event list for the badminton club',
        },
      ],
    },
  },
  {
    id: 'mscs',
    lane: 'education',
    title: 'M.S. Computer Science',
    org: 'Binghamton University',
    start: '2024-01',
    end: '2024-12',
    diff: {
      add: [
        'Coursework: Programming for the Web, Programming Languages, NLP, Human-Computer Interaction, Systems Programming, Database Systems',
      ],
    },
    plain: "I earned a master's degree in computer science.",
    stack: [],
    links: [],
  },
  {
    id: 'gomoku',
    lane: 'project',
    title: 'Gomoku',
    org: 'gomoku',
    start: '2024-08',
    diff: { add: ['Gomoku game engine and web UI in TypeScript'] },
    plain: 'A playable version of the five-in-a-row board game.',
    stack: ['TypeScript'],
    links: [gh('nthungdev/gomoku')],
  },
  {
    id: 'bing-ra',
    lane: 'work',
    title: 'Research Assistant',
    org: 'SUNY Binghamton',
    start: '2024-05',
    end: '2024-08',
    diff: {
      add: [
        'Automated data processing and statistical analysis for a faculty research project',
        'Optimized the existing analysis code',
      ],
    },
    plain: "I sped up and automated a professor's data analysis.",
    stack: ['Python', 'Statistics'],
    links: [],
  },
  {
    id: 'daminh',
    lane: 'project',
    title: 'Đa Minh Gò Vấp website',
    org: 'dongdaminhgovap.org',
    start: '2024-05',
    diff: {
      add: [
        'Live site for a congregation in Gò Vấp, Ho Chi Minh City',
        'Next.js, TypeScript, Tailwind, DecapCMS',
      ],
    },
    plain: 'The website for a community in Ho Chi Minh City, which they can edit themselves.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'DecapCMS'],
    links: [
      { label: 'Live site', href: 'https://dongdaminhgovap.org' },
      gh('nthungdev/da-minh-go-vap'),
    ],
    featured: {
      images: [
        {
          src: '/projectImgs/daminhgovap.png',
          width: 624,
          height: 334,
          alt: 'Đa Minh Gò Vấp congregation website home page',
        },
      ],
    },
  },
  {
    id: 'discord',
    lane: 'project',
    title: 'Discord AI chatbot',
    org: 'discord-bot',
    start: '2024-04',
    diff: {
      add: [
        'Context-aware replies that remember the conversation and adapt to each user',
        "Reacts with the server's own custom emoji",
        'Detects and hides offensive language automatically',
      ],
    },
    plain: 'A chatbot for Discord servers that remembers conversations and keeps chat clean.',
    stack: ['TypeScript', 'Node.js', 'Express', 'Discord.js'],
    links: [gh('nthungdev/discord-bot')],
    featured: {
      images: [
        {
          src: '/projectImgs/discordbot.png',
          width: 624,
          height: 463,
          alt: 'Discord AI chatbot replying in a server',
        },
      ],
    },
  },
  {
    id: 'crater',
    lane: 'work',
    title: 'Software Engineer',
    org: 'Crater',
    start: '2023-01',
    end: '2023-06',
    diff: {
      add: [
        'Built features for a social media app for creators',
        'Worked across the product with design and engineering teammates',
      ],
    },
    plain: 'I worked on a social media app made for creators.',
    stack: [],
    links: [],
  },
  {
    id: 'holler',
    lane: 'work',
    title: 'Software Engineer',
    org: 'Holler Technologies',
    start: '2021-06',
    end: '2023-06',
    diff: {
      add: [
        'Led development and launch of a cross-platform mobile app that passed 100,000 App Store users',
        'Added social sign-in, lifting sign-up rates by 150%',
        'Raised automated test coverage above 80%',
        'Built 4 prototype apps in 9 months to test new product ideas',
        'Primary code reviewer for the team; mentored other engineers',
      ],
    },
    plain: 'I led a mobile app that more than 100,000 people downloaded.',
    stack: ['Flutter', 'Firebase', 'Authentication', 'Testing'],
    links: [],
  },
  {
    id: 'ygo',
    lane: 'project',
    title: 'YGO Companion',
    org: 'ygo-companion',
    start: '2020-02',
    diff: {
      add: ['Companion app for Yu-Gi-Oh! players, still updated in 2026', 'Flutter'],
    },
    plain: 'A helper app for fans of a card game, still maintained.',
    stack: ['Flutter', 'Dart'],
    links: [{ label: 'Live app', href: 'https://nthungdev.github.io/ygo-companion/' }],
  },
  {
    id: 'platts',
    lane: 'education',
    title: 'B.S. Computer Science',
    org: 'SUNY Plattsburgh',
    start: '2016-09',
    end: '2020-05',
    diff: { add: ['Graduated May 2020'] },
    plain: "I earned a bachelor's degree in computer science.",
    stack: [],
    links: [],
  },
  {
    id: 'ta',
    lane: 'education',
    title: 'Teaching Assistant',
    org: 'SUNY Plattsburgh, Intro to Programming',
    start: '2019-09',
    diff: {
      add: [
        'Held office hours and assisted students during lab sessions for Introduction to Programming',
      ],
    },
    plain: 'I helped first-year students learn to code.',
    stack: [],
    links: [],
  },
  {
    id: 'asg',
    lane: 'work',
    title: 'Software Engineer',
    org: 'American Scholar Group',
    start: '2019-09',
    end: '2021-05',
    diff: {
      add: [
        'Built mobile-friendly, SEO-optimized marketing websites',
        'Made the sites faster by moving them to static site generation, with a refreshed UI',
        'Shipped content updates across several sites with the marketing team',
      ],
    },
    plain: 'I built and sped up marketing websites for a publisher.',
    stack: ['Static site generation', 'SEO', 'JavaScript'],
    links: [],
  },
  {
    id: 'copart',
    lane: 'work',
    title: 'Software Engineering Intern',
    org: 'Copart',
    start: '2019-05',
    end: '2019-08',
    diff: {
      add: [
        'Integrated Okta single sign-on into an existing web app',
        'Modernized legacy React components with Hooks',
      ],
    },
    plain: 'As an intern I added secure single sign-in to a web app.',
    stack: ['React', 'Okta', 'OAuth / SSO'],
    links: [],
  },
  {
    id: 'ergon',
    lane: 'work',
    title: 'Full Stack Developer',
    org: 'Ergon Training',
    start: '2019-04',
    end: '2021-06',
    diff: {
      add: [
        'Built a full-stack content management system from scratch (React, Express, Firebase) that cut time spent on internal tasks',
        'Built a library of reusable React components with Tailwind CSS',
      ],
    },
    plain: 'I built the internal tool a training company uses to manage its content.',
    stack: ['React', 'Express', 'Firebase', 'Tailwind CSS'],
    links: [],
  },
  {
    id: 'ra',
    lane: 'education',
    title: 'Resident Assistant',
    org: 'SUNY Plattsburgh',
    start: '2019-01',
    end: '2019-12',
    diff: {
      add: [
        'Liaison between students on my floor and the campus community',
        'Built community through programming, floor meetings and keeping the halls safe',
        'Helped first-year students settle in and get involved on campus',
      ],
    },
    plain: 'I looked after a floor of students living on campus.',
    stack: [],
    links: [],
  },
  {
    id: 'deliverit',
    lane: 'project',
    title: 'DeliverIt',
    org: 'Coding Hub',
    start: '2019-02',
    diff: {
      add: [
        'Led a team of 6 to build an online ordering app in 3 months',
        'React frontend, Express backend',
      ],
    },
    plain: 'I led a student team that built an online food-ordering app.',
    stack: ['React', 'Express'],
    links: [gh('coding-hub-org/deliverit')],
  },
  {
    id: 'shuttler',
    lane: 'project',
    title: 'Shuttler',
    org: 'Coding Hub',
    start: '2018-10',
    diff: {
      add: [
        'Live shuttle tracking that helped 100+ SUNY Plattsburgh students stop missing pickups in bad weather',
        'Flutter app on a real-time database for delay-free GPS updates',
      ],
    },
    plain: 'An app that shows students where the campus shuttle is right now.',
    stack: ['Flutter', 'Dart', 'Firebase'],
    links: [gh('coding-hub-org/shuttler-flutter')],
    featured: {
      images: [
        {
          src: '/projectImgs/shuttler.png',
          width: 624,
          height: 373,
          alt: 'Shuttler app showing the live shuttle position on a map',
        },
      ],
    },
  },
  {
    id: 'codinghub',
    lane: 'education',
    title: 'Co-founder & Tech Lead',
    org: 'Coding Hub',
    start: '2018-09',
    end: '2020-05',
    diff: {
      add: [
        'Built web and mobile apps that solved everyday problems for students, including Shuttler',
        'Ran weekly Scrum meetings and mentored 10+ members',
      ],
    },
    plain: 'I co-founded a student group that built apps for our campus.',
    stack: ['Scrum', 'Flutter', 'React'],
    links: [],
  },
  {
    id: 'yo',
    lane: 'project',
    title: 'Your Occasions',
    org: 'your-occasions',
    start: '2018-09',
    diff: {
      add: [
        'Flutter app to browse, create and promote local events',
        'Backend on Heroku PostgreSQL, Google Cloud, Cloudinary and Firebase',
      ],
    },
    plain: 'An app for finding and promoting events near you.',
    stack: ['Flutter', 'PostgreSQL', 'Google Cloud', 'Firebase'],
    links: [gh('nthungdev/your-occasions')],
  },
  {
    id: 'itd',
    lane: 'work',
    title: '.NET Developer Intern',
    org: 'ITD Group',
    start: '2018-05',
    end: '2018-08',
    diff: {
      add: [
        'Built a Windows ticketing tool for the parking system at Van Don International Airport',
        'Coordinated the intern team on the project with Trello and Redmine',
      ],
    },
    plain: 'As an intern I built a ticketing tool for an airport parking system.',
    stack: ['.NET', 'C#', 'Trello', 'Redmine'],
    links: [],
  },
  {
    id: 'hangman',
    lane: 'project',
    title: 'Initial commit: Hangman',
    org: 'hangmanpygame',
    start: '2018-01',
    diff: { add: ['First public repo: Hangman in Python and Pygame'] },
    plain: 'My first public project: the classic word-guessing game.',
    stack: ['Python', 'Pygame'],
    links: [gh('nthungdev/hangmanpygame')],
  },
]

export default timeline
