/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },

  // For Vercel deployment
  output: 'standalone',  // ← Optional: smaller deployment
  reactStrictMode: true, // ← Good practice
  swcMinify: true,       // ← Faster builds
  
};

module.exports = nextConfig;
