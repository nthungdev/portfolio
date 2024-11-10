import classNames from 'classnames'
import { FaDocker, FaMobileAlt } from 'react-icons/fa'
import { IoBrowsersOutline } from 'react-icons/io5'
import { GrReactjs } from 'react-icons/gr'
import { RiFlutterFill, RiNextjsLine, RiTailwindCssFill } from 'react-icons/ri'
import {
  SiExpress,
  SiFirebase,
  SiPostgresql,
  SiTypescript,
} from 'react-icons/si'
import BaseSection from './base-section'
import SectionTitle from './section-title'
import Chips from './chips'

const content = {
  title: 'Expertise',
  body: 'I am a full-stack developer with a passion for building web applications. I have experience with JavaScript, React, Node.js, and more.',
  expertise: [
    {
      icon: IoBrowsersOutline,
      title: 'Full Stack Development',
      body: `I have built a wide array of responsive web applications from the ground up using modern technologies such as Next.js to create scalable and performant solutions. With my proficiency in both front-end and back-end development, I'm skilled in applying agile methodologies to ensure efficient, iterative development.`,
      techStack: [
        'React',
        'Vue',
        'Next.js',
        'Node.js',
        'Express',
        'Firebase',
        'Google Cloud',
        'Docker',
        'RestAPI',
        'NoSQL',
        'SQL',
        'TypeScript',
        'JavaScript',
        'HTML5',
        'CSS3',
      ],
    },
    {
      icon: FaMobileAlt,
      iconClasses: '-ml-2',
      title: 'Mobile Development',
      body: 'I also build mobile applications using cross-platform frameworks such as Flutter to reach a broader audience of native users. Leveraging a single codebase for both iOS and Android, I can iterate and deliver high-quality applications in a fraction of the time without compromising the performance or user experience.',
      techStack: ['Flutter', 'Dart', 'Firebase', 'Swift', 'Kotlin'],
    },
  ],
  favoriteTechnologies: {
    title: 'My Favorite Technologies',
    technologies: [
      { name: 'TypeScript', icon: SiTypescript },
      { name: 'TailwindCSS', icon: RiTailwindCssFill },
      { name: 'React', icon: GrReactjs },
      { name: 'NextJS', icon: RiNextjsLine },
      { name: 'Flutter', icon: RiFlutterFill },
      { name: 'Firebase', icon: SiFirebase },
      { name: 'Docker', icon: FaDocker },
      { name: 'ExpressJS', icon: SiExpress },
      { name: 'PostgreSQL', icon: SiPostgresql },
    ],
  },
}

export default function ExpertiseSection() {
  return (
    <BaseSection>
      <SectionTitle>{content.title}</SectionTitle>

      <ul className="gap-16 mt-10 grid md:grid-cols-2">
        {content.expertise.map(
          ({ icon: Icon, iconClasses, title, body, techStack }) => (
            <li key={title} className="space-y-6">
              <Icon className={classNames('size-12', iconClasses)} />
              <h2 className="text-3xl md:text-4xl font-semibold">{title}</h2>
              <p className="text-lg">{body}</p>
              <Chips chips={techStack.map((name) => ({ name }))} />
            </li>
          )
        )}
      </ul>

      <h2 className="mt-20 text-3xl md:text-4xl font-semibold">
        {content.favoriteTechnologies.title}
      </h2>
      <div className="flex justify-center">
        <ul className="mt-6 gap-6 mx-auto inline-grid grid-flow-row grid-cols-3 sm:flex flex-row flex-wrap">
          {content.favoriteTechnologies.technologies.map(
            ({ icon: Icon, name }) => (
              <div
                key={name}
                className="group p-4 h-32 aspect-square border space-y-2 bg-gray-900"
              >
                <Icon className="size-16 mx-auto group-hover:scale-125 transition-transform" />
                <div className="text-center">{name}</div>
              </div>
            )
          )}
        </ul>
      </div>
    </BaseSection>
  )
}
