/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
}

module.exports = nextConfig
