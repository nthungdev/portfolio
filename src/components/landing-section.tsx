import classNames from 'classnames'
import Link from 'next/link'
import about from '@/content/about'
import IDS from '@/constants/ids'
import Image from 'next/image'

const content = about

export default function LandingSection() {
  return (
    <section
      className={classNames('min-h-[600px] h-[50vh] md:h-[75vh] landing-background')}
      id={IDS.landingSection}
    >
      <div className="relative h-full max-w-screen-xl mx-auto flex flex-col items-center justify-center md:block">
        <div className="md:absolute left-0 md:top-[50%] md:-translate-y-1/2 space-y-4 px-6 flex flex-col md:flex-row gap-x-6 items-center text-center md:text-left">
          <div>
            <Image
              src="/me.jpg"
              alt="Me"
              width={200}
              height={200}
              className="rounded-full saturate-[0.75] pointer-events-none select-none"
            />
          </div>
          <div className='flex flex-col gap-y-2'>
            <ul className="ml-0.5 space-x-2 order-3 md:order-none">
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
            <h1 className="-ml-0.5 text-5xl md:text-7xl font-bold">
              {content.name}
            </h1>
            <p className="text-2xl text-primary-400 font-semibold">
              {content.title}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
