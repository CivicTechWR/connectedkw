"use client"

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function AuthButtons() {
    const { data: session } = useSession()
    const pathname = usePathname()
    
    if (session) {
        return (
        <Link href="/auth/logout" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/auth`) ? 'border-b-2 border-red' : ''}`}>
            <span>{`Log out`}</span>
            <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-right-from-bracket`}></i></span>
        </Link>
    )
  }

  return (
    <Link href="/auth/login" className={`pb-1 text-black no-underline font-medium ${pathname.startsWith(`/auth`) ? 'border-b-2 border-red' : ''}`}>
        <span>{`Log in`}</span>
        <span className="hidden sm:inline"><i className={`ml-1 fa-solid fa-user`}></i></span>
    </Link>
  )
}
