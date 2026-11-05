import timeline from '@/content/timeline'
import BaseSection from './base-section'
import ProjectCard from './project-card'
import SectionTitle from './section-title'
import IDS from '@/constants/ids'
import ScrollElement from './scroll-element'

const featured = timeline.filter((e) => e.featured)

export default function ProjectsSection() {
  return (
    <BaseSection id={IDS.projectsSection}>
      <SectionTitle>Personal Projects</SectionTitle>

      <div className="mt-10 px-2 grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
        {featured.map((entry, index) => (
          <ScrollElement
            key={entry.id}
            direction={index % 2 === 0 ? 'left' : 'right'}
            viewport={{ once: true, amount: 0.2 }}
          >
            <ProjectCard
              project={{
                title: entry.title,
                description: entry.diff.add[0] ?? entry.plain,
                imageUrl: entry.featured?.images[0]?.src ?? '',
                gradientColor: { stop1: 'ff547e', stop2: 'ffb199' },
                githubUrl:
                  entry.links.find((l) => l.label === 'GitHub')?.href ?? '',
                projectUrl:
                  entry.links.find((l) => l.label !== 'GitHub')?.href ?? '',
                chips: entry.stack,
              }}
            />
          </ScrollElement>
        ))}
      </div>
    </BaseSection>
  )
}
