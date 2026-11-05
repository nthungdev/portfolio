export interface Highlight {
  value: string
  label: string
  source: string
}

const highlights: Highlight[] = [
  { value: '100,000+', label: 'people used the mobile app I led', source: 'Holler, 2021–2023' },
  { value: '+150%', label: 'more sign-ups after adding social sign-in', source: 'Holler' },
  { value: '100+', label: 'students tracked their campus shuttle live', source: 'Shuttler, 2018' },
  { value: '10+', label: 'student developers mentored', source: 'Coding Hub, 2018–2020' },
]

export default highlights
