const withMDX = require('@next/mdx')()
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
      {
        protocol: 'https',
        hostname: 'vqgbaydvbxbwpgbjrquo.supabase.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'wpl.libnet.info',
        pathname: '/images/events/wpl/**',
      },
      {
        protocol: 'https',
        hostname: 'events-calendar-public-us-east-2.s3.us-east-2.amazonaws.com',
        pathname: '/event-images/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.connectedkw.com',
        pathname: '/assets/**',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/maps/playgrounds',
        destination: '/maps/playgrounds-in-kitchener-waterloo',
        permanent: true,
      },
      {
        source: '/maps/public-art',
        destination: '/maps/public-art-in-waterloo-region',
        permanent: true,
      },
      {
        source: '/maps/splashpads',
        destination: '/maps/splashpads-in-waterloo-region',
        permanent: true,
      },
      {
        source: '/camps',
        destination: '/articles/summer-camps-2024',
        permanent: false,
      },
      {
        source: '/join',
        destination: 'https://cms.connectedkw.com/admin/register',
        permanent: false,
      }
    ]
  },
}

module.exports = withMDX(withPWA(nextConfig))
