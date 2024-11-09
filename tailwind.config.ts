import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import * as flowbite from 'flowbite-react/tailwind'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    flowbite.content(),
  ],
  theme: {
    extend: {
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
