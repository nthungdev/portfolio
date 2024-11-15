import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { ThemeModeScript } from 'flowbite-react'
import Footer from '@/components/footer'
import NavMenu from '@/components/nav-menu'
import CustomFlowbite from '@/components/custom-flowbite'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
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
    <html lang="en">
      <head suppressHydrationWarning>
        <ThemeModeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <CustomFlowbite>
          <NavMenu />
          {children}
          <Footer />
        </CustomFlowbite>
      </body>
    </html>
  )
}
