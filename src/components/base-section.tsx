import { ComponentProps } from 'react'

export default function BaseSection(props: ComponentProps<'section'>) {
  return (
    <section className="px-6 py-12 md:py-20 bg-gray-800" {...props}>
      <div className="max-w-screen-xl mx-auto">
        {props.children}
      </div>
    </section>
  )
}
