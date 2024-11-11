import projects from '@/app/content/projects'
import BaseSection from './base-section'
import ProjectCard from './project-card'
import SectionTitle from './section-title'

const content = projects

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
