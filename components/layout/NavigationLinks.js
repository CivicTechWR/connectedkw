'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationLinks({ className, children, id }) {
  const pathname = usePathname()
  
  return (
    <nav className="flex gap-4 lg:gap-6 items-center">
        <Link href="/events" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/events`) ? 'border-b-2 border-red' : ''}`}>
            <span>{`Events`}</span>
            <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-calendar-day`}></i></span>
        </Link>
        <Link href="/articles" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/articles`) ? 'border-b-2 border-red' : ''}`}>
            <span>{`Local info`}</span>
            <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-circle-info`}></i></span>
        </Link>
        <Link href="/profiles" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/profiles`) ? 'border-b-2 border-red' : ''}`}>
            <span>{`Volunteer Directory`}</span>
            <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-handshake-angle`}></i></span>
        </Link>
    </nav>
  )
}
