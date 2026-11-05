export interface SkillLayer {
  id: 'infra' | 'backend' | 'web' | 'mobile'
  label: string
  items: string[]
}

/** Ordered infrastructure first to mobile last; the UI renders it reversed. */
const skills: SkillLayer[] = [
  { id: 'infra', label: 'AI & Infrastructure', items: ['Docker', 'Firebase', 'Google Cloud', 'Azure'] },
  {
    id: 'backend',
    label: 'Backend',
    items: ['Node.js', 'Express', 'Django', 'Python', 'PostgreSQL', 'MongoDB', 'SQL', 'PayloadCMS', 'OAuth / SSO'],
  },
  {
    id: 'web',
    label: 'Web',
    items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Vue', 'Tailwind CSS', 'HTML', 'CSS', 'Shopify'],
  },
  { id: 'mobile', label: 'Mobile', items: ['Flutter', 'React Native', 'PWA', 'Swift', 'Kotlin'] },
]

export default skills
