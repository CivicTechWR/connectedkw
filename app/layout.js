import localFont from 'next/font/local';
const slackey = localFont({ src: '../fonts/Slackey/Slackey-Regular.ttf', variable: "--font-slackey" })
import NavigationHeader from 'components/NavigationHeader'
import Footer from 'components/Footer'
import 'aos/dist/aos.css';
import '../styles/globals.css'

export default function RootLayout({
    // Layouts must accept a children prop.
    // This will be populated with nested layouts or pages
    children,
  }) {
    return (
      <html lang="en">
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
