import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import OutsideClickHandler from 'react-outside-click-handler';
import Train from 'components/Train'
import Footer from 'components/Footer'
import styles from 'styles/navbar.module.css'

const stops = [
  { name: `Events`, slug: `events` },
  { name: `Places`, slug: `maps` },
  { name: `Blog`, slug: `articles` },
]


const Layout = ({
  title="Connected KW",
  description="Things to do in Kitchener Waterloo for families, children, and your inner child",
  image,
  color="rainbow",
  className="",
  children }) => {

  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuHidden, setMenuHidden] = useState(true)
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`
  const shareImageUrl = image ? image : `${process.env.NEXT_PUBLIC_BASE_URL}/share-image.jpg`

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  useEffect(() => {
    if (!menuOpen) {
      setTimeout(() => {
        setMenuHidden(true)
      }, 500)
    }
  }, [menuOpen])

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const openMenu = () => {
    setMenuHidden(false)
    setTimeout(() => {
      setMenuOpen(true)
    }, 50)
  }

  useEffect(() => {
    router.events.on('hashChangeStart', closeMenu);
    router.events.on('routeChangeStart', closeMenu);

    return () => {
      router.events.off('hashChangeStart', closeMenu);
      router.events.off('routeChangeStart', closeMenu);
    }
  }, [router.events]);

  // const currentStop = stops.find(stop => router.pathname.startsWith(`/${stop.slug}`)) || stops[0]

  return (
    <div className={`flex flex-auto flex-col justify-stretch items-stretch min-h-screen w-full ${className}`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="image" content={shareImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={shareImageUrl} />
        <meta name="twitter:creator" content="@connectedkw" />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={shareImageUrl} />
        <meta property="og:description" content={description} />
      </Head>

      <header>
        <div className="px-5 mx-auto flex justify-between items-center text-black max-sm:text-sm">
          <Link href="/">
            <Image src="/icon-03.svg" height="80" width="80" alt="Connected KW" />
          </Link>
          <p className="hidden lg:block mb-0">
            A community-based resource for families in KW
          </p>
          <div className="flex gap-4 lg:gap-6 items-center">
            <nav>
              <Link href="/events" className={`pb-1 text-black no-underline font-medium ${router.pathname.startsWith(`/events`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Events`}</span>
                <i className={`ml-1 fa-solid fa-calendar-day hidden sm:inline`}></i>
              </Link>
            </nav>
            <nav>
              <Link href="/articles" className={`pb-1 text-black no-underline font-medium ${router.pathname.startsWith(`/articles`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Local info`}</span>
                <i className={`ml-1 fa-solid fa-circle-info hidden sm:inline`}></i>
              </Link>
            </nav>
            <nav>
              <a href="https://buy.stripe.com/cN24hE161goQcZa8wx" target="_blank" className="text-black no-underline font-medium" rel="noreferrer">
                Support us                
                <i className={`ml-1 fa-solid fa-circle-dollar-to-slot hidden sm:inline`}></i>
              </a>
            </nav>
            <nav>
              <Link href="/auth/login" className={`pb-1 text-black no-underline font-medium ${router.pathname.startsWith(`/auth/login`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Login`}</span>
                <i className={`ml-1 fa-solid fa-sign-in hidden sm:inline`}></i>
              </Link>
            </nav>
            <nav>
              <Link href="/profiles" className={`pb-1 text-black no-underline font-medium ${router.pathname.startsWith(`/auth/login`) ? 'border-b-2 border-red' : ''}`}>
                <span>{`Profiles`}</span>
                <i className={`ml-1 fa-solid fa-user hidden sm:inline`}></i>
              </Link>
            </nav>
          </div>
        </div>
      </header>


      <main className={`flex-auto snap-y`}>

        {children}

      </main>

      <Footer />
    </div>
  )
}

export default Layout
