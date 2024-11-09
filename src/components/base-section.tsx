import { ComponentProps } from 'react'

export default function BaseSection(props: ComponentProps<'section'>) {
  return (
    <section className="px-4 py-12 bg-gray-800" {...props}>
      <div className="max-w-screen-lg mx-auto">
        {props.children}
      </div>
    </section>
  )
}
