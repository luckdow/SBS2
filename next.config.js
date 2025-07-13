/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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