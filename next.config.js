// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  // --- DÜZELTİLMİŞ BÖLÜM ---
  env: {
    // Doğru değişken adı burada kullanıldı
    NEXT_PUBLIC_Maps_API_KEY: process.env.NEXT_PUBLIC_Maps_API_KEY,
  },
};

module.exports = nextConfig;
