'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IoOpenOutline } from 'react-icons/io5'
import { BsGithub } from 'react-icons/bs'
import { MdInsertPhoto } from 'react-icons/md'
import Chips from './chips'
import { useRef, useState } from 'react'

interface Project {
  title: string
  description: string
  imageUrl: string
  gradientColor: {
    stop1: string
    stop2: string
  }
  githubUrl: string
  projectUrl: string
  chips: string[]
}

export default function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate 3D tilt angles (max ~8 degrees)
    const rotateX = ((y - centerY) / centerY) * -7
    const rotateY = ((x - centerX) / centerX) * 7

    setTilt({ x: rotateX, y: rotateY })
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setGlare((prev) => ({ ...prev, opacity: 0 }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
      className="group relative flex flex-col rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-primary-500/40 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/30"
    >
      {/* Glare Reflection Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 z-30"
        style={{
          background: `radial-gradient(350px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 70%)`,
        }}
      />

      {/* Image Preview Banner */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-neutral-950 border-b border-neutral-800">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex justify-center items-center">
            <MdInsertPhoto className="size-10 text-neutral-600" />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-6 space-y-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          {project.title}
        </h3>

        <p className="text-neutral-300 text-sm leading-relaxed flex-1">
          {project.description}
        </p>

        <div className="pt-2">
          <Chips
            chips={project.chips.map((name) => ({
              name,
              colorClasses: 'bg-neutral-800 text-neutral-300 border border-neutral-700/60',
            }))}
          />
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800/80">
          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-mono font-medium border border-neutral-700 transition-colors"
            >
              <BsGithub className="size-4" />
              Source
            </Link>
          )}

          {project.projectUrl && (
            <Link
              href={project.projectUrl}
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white text-xs font-mono font-medium border border-primary-500 transition-colors shadow-sm"
            >
              <IoOpenOutline className="size-4" />
              Live Demo
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
