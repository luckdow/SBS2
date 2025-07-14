// luckdow/sbs2/SBS2-c249c1601b5731f9f0996ec8eeee315cd133ea41/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    esmExternals: 'loose'
  },
  // BU BLOĞU EKLEYİN VEYA GÜNCELLEYİN
  env: {
    NEXT_PUBLIC_Maps_API_KEY: process.env.NEXT_PUBLIC_Maps_API_KEY,
  },
}

module.exports = nextConfig
