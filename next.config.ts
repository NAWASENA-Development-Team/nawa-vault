import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan akses dari IP lokal
  experimental: {
    serverActions: {
      allowedOrigins: ['192.168.1.125:3000', 'localhost:3000']
    },
    // optimizePackageImports: [
    //   'lucide-react',
    //   'framer-motion',
    //   'drizzle-orm',
    // ],
  },

  // Netlify handles compression at CDN level — no need for Next.js compression
  compress: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    // Jika nanti ada image dari domain lain, tambahkan di sini:
    // remotePatterns: [{ hostname: 'example.com' }],
  },

  poweredByHeader: false,
};

export default nextConfig;
