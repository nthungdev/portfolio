import projects from '@/content/projects'
import BaseSection from './base-section'
import ProjectCard from './project-card'
import SectionTitle from './section-title'
import IDS from '@/constants/ids'
import ScrollElement from './scroll-element'

const content = projects

export default function ProjectsSection() {
  return (
    <BaseSection id={IDS.projectsSection}>
      <SectionTitle>{content.title}</SectionTitle>

      <div className="mt-10 px-2 grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-8">
        {content.projects.map((project, index) => (
          <ScrollElement
            key={index}
            direction={index % 2 === 0 ? 'left' : 'right'}
            viewport={{ once: false, amount: 0.3, margin: '50px 0px 50px 0px' }}
          >
            <ProjectCard project={project} />
          </ScrollElement>
        ))}
      </div>
    </BaseSection>
  )
}
