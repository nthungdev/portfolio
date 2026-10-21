'use client'

import classNames from 'classnames'
import Link from 'next/link'
import about from '@/content/about'
import IDS from '@/constants/ids'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import DragCloseDrawer from '@/components/drag-close-drawer'
import { RiFileUserFill } from 'react-icons/ri'
import fireConfetti from '@/utils/fireConfetti'

const content = about

export default function LandingSection() {
  const [showResume, setShowResume] = useState(false)

  const handleResumeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    fireConfetti(e.currentTarget)
    setShowResume(true)
  }

  return (
    <section
      className={classNames(
        'relative min-h-[620px] h-[55vh] md:h-[75vh] landing-background flex items-center justify-center overflow-hidden'
      )}
      id={IDS.landingSection}
    >
      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row gap-8 items-center text-center md:text-left justify-center md:justify-start">
        {/* Avatar with soft subtle ambient glow ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-md group-hover:opacity-60 transition duration-500" />
          <Image
            src="/me.jpg"
            alt="Hung Nguyen"
            width={190}
            height={190}
            priority
            className="relative rounded-full pointer-events-none select-none ring-2 ring-white/10 shadow-2xl"
          />
        </motion.div>

        {/* Content Typography */}
        <div className="flex flex-col gap-y-3">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex justify-center md:justify-start"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-neutral-900/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Lead Software Engineer @ Venera AI
            </span>
          </motion.div>

          {/* Name Header with Editorial Blur-Fade */}
          <motion.div
            initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              {content.name}
            </h1>
          </motion.div>

          {/* Title Subheader */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xl md:text-2xl text-primary-400 font-semibold tracking-wide">
              {content.title} & Systems Engineer
            </p>
          </motion.div>

          {/* Social Links & Resume CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex flex-row justify-center md:justify-start items-center gap-4 mt-2"
          >
            {content.socialLinks.map(({ name, url, Icon }) => (
              <Link
                key={name}
                href={url}
                target="_blank"
                className="p-2 rounded-full bg-neutral-900/60 hover:bg-primary-600 text-neutral-300 hover:text-white border border-neutral-800 hover:border-primary-500 transition-all duration-200 hover:scale-110 shadow-sm"
                aria-label={name}
              >
                <Icon className="size-5" />
              </Link>
            ))}

            {/* Resume Button with Confetti Trigger */}
            <button
              onClick={handleResumeClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700 hover:border-neutral-500 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-sm group"
            >
              <RiFileUserFill className="size-5 text-primary-400 group-hover:scale-110 transition-transform" />
              <span>Resume</span>
            </button>
          </motion.div>

          {/* Resume Viewer Drawer */}
          <DragCloseDrawer open={showResume} setOpen={setShowResume}>
            <iframe
              src={content.resumeEmbedUrl}
              className="mx-auto max-w-screen-lg"
              allow="autoplay"
              width="100%"
              height="100%"
            />
          </DragCloseDrawer>
        </div>
      </div>
    </section>
  )
}
