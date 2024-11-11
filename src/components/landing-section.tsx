import classNames from 'classnames'
import Link from 'next/link'
import about from '@/app/content/about'
import IDS from '@/constants/ids'

const content = about

export default function LandingSection() {
  return (
    <section className={classNames('h-screen')} id={IDS.landingSection}>
      <div className="relative h-full max-w-screen-lg mx-auto">
        <div className="absolute left-0 top-[50%] -translate-y-1/2 p-6 md:ml-16 lg:ml-24 space-y-4">
          <ul className="ml-0.5 space-x-2">
            {content.socialLinks.map(({ name, url, Icon }) => (
              <Link
                key={name}
                href={url}
                target="_blank"
                className="hover:text-primary transition-colors"
              >
                <Icon className="inline size-5" />
              </Link>
            ))}
          </ul>
          <h1 className="-ml-0.5 text-6xl md:text-7xl font-bold">
            {content.name}
          </h1>
          <p className="text-2xl text-primary">{content.title}</p>
        </div>
      </div>
    </section>
  )
}
