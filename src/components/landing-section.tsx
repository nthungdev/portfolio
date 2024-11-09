import classNames from 'classnames'
import Link from 'next/link'
import { BsGithub, BsLinkedin } from 'react-icons/bs'

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/nthungdev',
    Icon: BsGithub,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/nthungdev/',
    Icon: BsLinkedin,
  },
]

export default function LandingSection() {
  return (
    <section className={classNames('h-screen')}>
      <div className="relative h-full max-w-screen-lg mx-auto">
        <div className="absolute left-0 top-[50%] -translate-y-1/2 p-6 md:ml-16 lg:ml-24 space-y-4">
          <ul className='ml-0.5 space-x-2'>
            {socialLinks.map(({name, url, Icon}) => (
              <Link key={name} href={url} target='_blank'>
                <Icon className='inline size-5' />
              </Link>
            ))}
          </ul>
          <h1 className="-ml-0.5 text-6xl md:text-7xl font-bold">Hung Nguyen</h1>
          <p className='text-2xl text-primary'>Full Stack Developer</p>
        </div>
      </div>
    </section>
  )
}
