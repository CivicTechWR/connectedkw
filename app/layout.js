import localFont from 'next/font/local';
const slackey = localFont({ src: '../assets/fonts/Slackey/Slackey-Regular.ttf', variable: "--font-slackey" })
import AuthProvider from 'components/auth/AuthProvider'
import NavigationHeader from 'components/layout/NavigationHeader'
import Footer from 'components/layout/Footer'
import Script from 'next/script'
import PlausibleProvider from 'next-plausible'
import InfoNotification from 'components/notifications/InfoNotification'
import { Suspense } from 'react'

import '../styles/globals.css'

export const metadata = {
  title: {
    default: 'Connected KW',
    template: '%s | Connected KW',
  },
  description: `Connected KW is a community guide for Kitchener, Waterloo, and the surrounding areas. Stay connected, get involved, and discover what's happening near you.`,
  keywords: ['Kitchener', 'Waterloo', 'Cambridge', 'Kitchener-Waterloo', 'KW', 'local', 'guide', 'events', 'community', 'listings', 'things to do', 'events calendar', 'things to do in Kitchener', 'things to do in Waterloo', 'things to do in Cambridge'],
  openGraph: {
    title: 'Connected KW',
    description: 'Connected KW is a community guide for Kitchener, Waterloo, and the surrounding areas. Stay connected, get involved, and discover what\'s happening near you.',
    url: 'https://www.connectedkw.com',
    siteName: 'Connected KW',
    locale: 'en_CA',
    type: 'website',
    images: [
      {
        url: 'https://www.connectedkw.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Connected KW',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Connected KW',
    description: 'Connected KW is a community guide for Kitchener, Waterloo, and the surrounding areas. Stay connected, get involved, and discover what\'s happening near you.',
    images: ['https://www.connectedkw.com/opengraph-image.png'],
  },
  metadataBase: new URL('https://www.connectedkw.com'),
}

export const viewport = {
  themeColor: '#D81E5B',
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}) {
  return (
    <html lang="en">
      <Script src="https://kit.fontawesome.com/231142308d.js" async crossOrigin="anonymous"></Script>
      <PlausibleProvider domain="connectedkw.com">
        <body className={`${slackey.variable}`} position="relative">
          <div className={`flex flex-auto flex-col justify-stretch items-stretch min-h-screen w-full`}>
            <AuthProvider>
              <NavigationHeader />
              <Suspense fallback={null}>
                <InfoNotification />
              </Suspense>
              <main className="flex-auto snap-y">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </div>
        </body>
      </PlausibleProvider>
    </html >
  )
}


