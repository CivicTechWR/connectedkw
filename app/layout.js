import localFont from 'next/font/local';
const slackey = localFont({ src: '../fonts/Slackey/Slackey-Regular.ttf', variable: "--font-slackey" })

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
          {children}
        </body>
      </html>
    )
  }