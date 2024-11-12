import { ReactNode } from 'react'

export default function SectionTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-4xl md:text-6xl font-bold mb-8">{children}</h1>
}
