import classNames from 'classnames'
import { ReactNode } from 'react'

export default function SectionTitle({
  children,
  center,
}: {
  children: ReactNode
  center?: boolean
}) {
  return (
    <h1
      className={classNames(
        'text-4xl md:text-6xl font-bold mb-8',
        center && 'text-center'
      )}
    >
      {children}
    </h1>
  )
}
