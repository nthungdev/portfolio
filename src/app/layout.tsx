import type { Metadata } from 'next'
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Condensed,
} from 'next/font/google'
import './globals.css'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import AnalyticsTrigger from '@/components/analytics-trigger'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://hungnguyen.dev'),
  title: { default: 'Hung Nguyen · Lead Software Engineer', template: '%s · Hung Nguyen' },
  description:
    'Hung Nguyen builds web, mobile and AI products end to end. Lead Software Engineer at Venera AI.',
  openGraph: { type: 'website', siteName: 'Hung Nguyen' },
  twitter: { card: 'summary_large_image' },
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-bp-btn focus:px-3 focus:py-2 focus:text-bp-btn-fg"
        >
          Skip to content
        </a>
        <AnalyticsTrigger />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
