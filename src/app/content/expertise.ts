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

const expertise = {
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

export default expertise
