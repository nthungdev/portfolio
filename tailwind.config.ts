import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import theme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: [
    'variant',
    [
      '@media (prefers-color-scheme: dark) { &:not(:is(.light *)) }',
      '&:is(.dark *)',
    ],
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        ...theme.screens,
        'xs': '480px',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        primary: {
          ...colors.blue,
          DEFAULT: colors.blue[500],
        },

        bp: {
          bg: 'var(--bp-bg)',
          surface: 'var(--bp-surface)',
          ink: 'var(--bp-ink)',
          muted: 'var(--bp-muted)',
          line: 'var(--bp-line)',
          grid: 'var(--bp-grid)',
          accent: 'var(--bp-accent)',
          add: 'var(--add)',
          del: 'var(--del)',
          btn: 'var(--btn)',
          'btn-fg': 'var(--btn-fg)',
        },
        lane: {
          work: 'var(--lane-work)',
          edu: 'var(--lane-edu)',
          com: 'var(--lane-com)',
          proj: 'var(--lane-proj)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', ...theme.fontFamily.sans],
        sans: ['var(--font-sans)', ...theme.fontFamily.sans],
        mono: ['var(--font-mono)', ...theme.fontFamily.mono],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
    },
  },
  plugins: [],
}
export default config
