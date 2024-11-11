import footer from '@/app/content/footer'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="py-10 px-6">
      <div className="flex flex-col items-center justify-center space-y-2">
        <ul className="ml-0.5 space-x-2">
          {footer.socialLinks.map(({ name, url, Icon }) => (
            <Link key={name} href={url} target="_blank" className='hover:text-primary transition-colors'>
              <Icon className="inline size-5" />
            </Link>
          ))}
        </ul>
        <p>{footer.body}</p>
      </div>
    </footer>
  )
}
