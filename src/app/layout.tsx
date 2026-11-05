import type { Metadata } from 'next'
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
} from 'next/font/google'
import './globals.css'
import Footer from '@/components/footer'
import NavMenu from '@/components/nav-menu'
import AnalyticsTrigger from '@/components/analytics-trigger'
import SmoothScrollProvider from '@/components/providers/smooth-scroll'
import { THEME_INIT_SCRIPT } from '@/lib/theme'

const display = IBM_Plex_Sans_Condensed({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
})
const sans = IBM_Plex_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})
const mono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Hung Nguyen',
  description: 'Hung Nguyen Portfolio',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased relative">
        <SmoothScrollProvider>
          <AnalyticsTrigger />
          <NavMenu />
          {children}
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
