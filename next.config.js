/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'chatflow.vercel.app'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
}

module.exports = nextConfig