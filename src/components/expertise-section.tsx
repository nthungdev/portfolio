import classNames from 'classnames'
import BaseSection from './base-section'
import SectionTitle from './section-title'
import Chips from './chips'
import expertise from '@/app/content/expertise'
import IDS from '@/constants/ids'

const content = expertise

export default function ExpertiseSection() {
  return (
    <BaseSection id={IDS.expertiseSection}>
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
