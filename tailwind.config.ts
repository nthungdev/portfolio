import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import theme from 'tailwindcss/defaultTheme'
import * as flowbite from 'flowbite-react/tailwind'

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    flowbite.content(),
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
      },
    },
  },
  plugins: [flowbite.plugin()],
}
export default config
