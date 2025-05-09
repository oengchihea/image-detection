/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add these experimental options to help with module resolution
  experimental: {
    esmExternals: 'loose',
  }
}

export default nextConfig
