import { ComponentProps } from 'react'

export default function BaseSection(props: ComponentProps<'section'>) {
  return (
    <section className="px-4 md:px-6 py-12 md:py-20" {...props}>
      <div className="max-w-screen-2xl mx-auto">
        {props.children}
      </div>
    </section>
  )
}
