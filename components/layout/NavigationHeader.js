'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function NavigationHeader({ className, children, id }) {
  const pathname = usePathname()
  return (
    <header>
        <div className="container max-w-screen-xl mx-auto px-5 flex justify-between items-center text-black max-sm:text-sm">
            <div className="flex gap-4 lg:gap-6 items-center">
                <Link href="/">
                    <Image src="/icon-03.svg" height="80" width="80" alt="Connected KW" />
                </Link>
            </div>
            <div className="flex gap-4 lg:gap-6 items-center">
                <nav>
                    <Link href="/events" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/events`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Events`}</span>
                <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-calendar-day`}></i></span>
            </Link>
            </nav>
            <nav>
            <Link href="/articles" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/articles`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Local info`}</span>
                <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-circle-info`}></i></span>
            </Link>
            </nav>
            <nav>
            <Link href="/profiles" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/profiles`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Directory`}</span>
                <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-user`}></i></span>
            </Link>
            </nav>
        </div>
        </div>
    </header>
  )
}
