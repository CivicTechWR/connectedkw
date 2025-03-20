import localFont from 'next/font/local';
const slackey = localFont({ src: '../fonts/Slackey/Slackey-Regular.ttf', variable: "--font-slackey" })
import NavigationHeader from 'components/NavigationHeader'
import Footer from 'components/Footer'
import Head from 'next/head'
import Script from 'next/script'

import 'aos/dist/aos.css';
import '../styles/globals.css'

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
  }) {
    return (
      <html lang="en">
        <Script src="https://kit.fontawesome.com/231142308d.js" async crossOrigin="anonymous"></Script>
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-maskable-512.png"></link>
          <meta name="application-name" content="Connected KW" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Connected KW" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#D81E5B" />

          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        </Head>
        <body className={`${slackey.variable}`}>
            <div className={`flex flex-auto flex-col justify-stretch items-stretch min-h-screen w-full`}>
                <NavigationHeader />
                <main className={`flex-auto snap-y`}>

                    {children}

                </main>

                <Footer />
            </div>
        </body>
      </html>
    )
  }
