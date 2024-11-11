'use client'

import classNames from 'classnames'
import style from './project-card.module.scss'
import Chips from './chips'
import { IoOpenOutline } from 'react-icons/io5'
import { BsGithub } from 'react-icons/bs'
import Link from 'next/link'
import { Button } from 'flowbite-react'
import Image from 'next/image'
import { MdInsertPhoto } from 'react-icons/md'

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
    <div className={classNames(style.card, 'bg-gray-50 aspect-video')}>
      <div className={classNames(style.cover)}>
        {project.imageUrl ? (
          <Image src={project.imageUrl} objectFit='cover' fill alt={project.title} />
        ) : (
          <div className="h-full w-full flex justify-center items-center">
            <MdInsertPhoto className="size-10 text-black" />
          </div>
        )}
      </div>

      <div
        className={classNames(
          style.content,
          'flex flex-col p-6 text-gray-800 gap-y-6'
        )}
      >
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <p className="">{project.description}</p>
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
