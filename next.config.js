/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  // API anahtarının DOĞRU VE STANDART ADIYLA okunmasını sağlıyoruz.
  env: {
    NEXT_PUBLIC_Maps_API_KEY: process.env.NEXT_PUBLIC_Maps_API_KEY,
  },
};

module.exports = nextConfig;
