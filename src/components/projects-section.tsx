import BaseSection from './base-section'
import ProjectCard from './project-card'
import SectionTitle from './section-title'

const content = {
  title: 'Personal Projects',
  projects: [
    {
      title: 'Event Management System',
      description:
        'A comprehensive event management system enabling organizers to effortlessly create and manage events, while providing members with an intuitive platform to browse, register, and participate.',
      imageUrl: '/projectImgs/vnbadminton.png',
      gradientColor: {
        stop1: 'ff547e',
        stop2: 'ffb199',
      },
      githubUrl: 'https://github.com/nthungdev/vn-badminton-club',
      projectUrl: 'https://vnbadminton.club',
      chips: [
        'React',
        'Next.js',
        'TypeScript',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'Firebase',
      ],
    },
    {
      title: 'Congregation Site',
      description:
        'A website for a congregation in Go Vap, Ho Chi Minh City, Vietnam. The website provides information about the congregation, including its history, beliefs, and activities.',
      imageUrl: '/projectImgs/daminhgovap.png',
      gradientColor: {
        stop1: 'ff547e',
        stop2: 'ffb199',
      },
      githubUrl: 'https://github.com/nthungdev/da-minh-go-vap',
      projectUrl: '',
      chips: [
        'React',
        'Next.js',
        'TypeScript',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'DecapCMS',
      ],
    },
    {
      title: 'Discord Chat Bot',
      description:
        'A Discord chat bot that can have conversation with users and keep track of check-ins.',
      imageUrl: '/projectImgs/discordbot.png',
      gradientColor: {
        stop1: 'ff547e',
        stop2: 'ffb199',
      },
      githubUrl: 'https://github.com/nthungdev/discord-bot',
      projectUrl: '',
      chips: ['TypeScript', 'Express.js', 'Node.js', 'Discord.js'],
    },
    {
      title: 'Shuttler',
      description:
        'Shuttler is a mobile application, Android and iOS, to help students track the shuttler at SUNY Plattsburgh Users can see the shuttle position in real time displayed on a map.',
      imageUrl: '/projectImgs/shuttler.png',
      gradientColor: {
        stop1: 'ff547e',
        stop2: 'ffb199',
      },
      githubUrl: 'https://github.com/coding-hub-org/shuttler-flutter',
      projectUrl: '',
      chips: ['Flutter', 'Dart', 'Firebase'],
    },
    // {
    //   title: 'Your Occasions',
    //   description:
    //     'Your Occasions will offer people easy access to events near them, where they are able to see available events in the area.',
    //   imageUrl:
    //     'https://camo.githubusercontent.com/51e9c0061016b1dcf10622affa39358c1ddf2a2e/68747470733a2f2f692e696d6775722e636f6d2f503453335039452e706e67',
    //   gradientColor: {
    //     stop1: 'ff547e',
    //     stop2: 'ffb199',
    //   },
    //   githubUrl: 'https://github.com/nthungdev/YourOccasions',
    //   projectUrl: '',
    //   chips: [],
    // },
  ],
}

export default function ProjectsSection() {
  return (
    <BaseSection>
      <SectionTitle>{content.title}</SectionTitle>

      <div className="mt-10 px-2 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {content.projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </BaseSection>
  )
}
