const withPwa = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = withPwa({
  output: 'export',
  reactStrictMode: true,
  swcMinify: false,

  images: {
    unoptimized: true,
  },
})

module.exports = nextConfig
