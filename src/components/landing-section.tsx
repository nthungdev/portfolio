'use client'

import classNames from 'classnames'
import Link from 'next/link'
import about from '@/content/about'
import IDS from '@/constants/ids'
import Image from 'next/image'
import BoxReveal from '@/components/box-reveal'
import { useState } from 'react'
import DragCloseDrawer from '@/components/drag-close-drawer'
import { RiFileUserFill } from 'react-icons/ri'

const content = about
const boxRevealColor = '#3b82f6'

export default function LandingSection() {
  const [showResume, setShowResume] = useState(false)

  return (
    <section
      className={classNames(
        'min-h-[600px] h-[50vh] md:h-[75vh] landing-background'
      )}
      id={IDS.landingSection}
    >
      <div className="relative h-full max-w-screen-xl mx-auto flex flex-col items-center justify-center md:items-start">
        <div className="space-y-4 px-6 flex flex-col md:flex-row gap-x-6 items-center text-center md:text-left">
          <div>
            <Image
              src="/me.jpg"
              alt="Me"
              width={200}
              height={200}
              priority
              className="rounded-full pointer-events-none select-none"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="order-3 md:order-none flex flex-row justify-center md:block">
              <BoxReveal boxColor={boxRevealColor}>
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
                  <button onClick={() => setShowResume(true)}>
                    <RiFileUserFill className="inline size-6 hover:text-primary transition-colors" />
                  </button>
                </ul>
              </BoxReveal>
            </div>
            <div className="flex flex-row justify-center md:block">
              <BoxReveal boxColor={boxRevealColor}>
                <h1 className="pb-1 -ml-0.5 text-5xl md:text-7xl font-bold">
                  {content.name}
                </h1>
              </BoxReveal>
            </div>
            <div className="flex flex-row justify-center md:block">
              <BoxReveal boxColor={boxRevealColor}>
                <p className="text-2xl text-primary-400 font-semibold">
                  {content.title}
                </p>
              </BoxReveal>
            </div>

            <DragCloseDrawer open={showResume} setOpen={setShowResume}>
              <iframe
                src={content.resumeEmbedUrl}
                className="mx-auto max-w-screen-lg"
                allow="autoplay"
                width="100%"
                height="100%"
              ></iframe>
            </DragCloseDrawer>
          </div>
        </div>
      </div>
    </section>
  )
}
