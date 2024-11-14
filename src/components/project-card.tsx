'use client'

import classNames from 'classnames'
import { Button } from 'flowbite-react'
import Image from 'next/image'
import Link from 'next/link'
import { IoOpenOutline } from 'react-icons/io5'
import { BsGithub } from 'react-icons/bs'
import { MdInsertPhoto } from 'react-icons/md'
import Chips from './chips'
import style from './project-card.module.scss'

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
  return (
    <div className={classNames(style.card, 'bg-gray-50 aspect-[1/1.2] xs:aspect-square sm:aspect-video')}>
      <div className={classNames(style.cover, 'relative')}>
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            className='object-cover'
            fill
            alt={project.title}
          />
        ) : (
          <div className="h-full w-full flex justify-center items-center">
            <MdInsertPhoto className="size-10 text-black" />
          </div>
        )}
      </div>

      <div
        className={classNames(
          style.content,
          'flex flex-col p-4 md:p-5 2xl:p-6 text-gray-800 gap-y-2 overflow-y-auto'
        )}
      >
        <div className="flex-1 space-y-1 sm:space-y-2 xl:space-y-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{project.title}</h2>
          <p>{project.description}</p>
          <Chips
            chips={project.chips.map((name) => ({
              name,
              colorClasses: 'bg-gray-700 text-gray-50',
            }))}
          />
        </div>

        <div className="flex flex-row justify-end gap-x-2">
          {project.githubUrl && (
            <Button
              as={Link}
              href={project.githubUrl}
              color="gray"
              target='_blank'
              className="hover:brightness-90 hover:text-primary flex flex-row items-center"
            >
              <BsGithub className="mr-3 size-5" />
              GitHub
            </Button>
          )}

          {project.projectUrl && (
            <Button
              as={Link}
              href={project.projectUrl}
              color="gray"
              target='_blank'
              className="hover:brightness-90 hover:text-primary flex flex-row items-center"
            >
              <IoOpenOutline className="mr-3 size-5" />
              Open
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
