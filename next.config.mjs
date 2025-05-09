/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed the experimental.esmExternals option as it's causing issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Added module resolution configuration
  webpack: (config) => {
    // Add this to help with module resolution
    config.resolve.modules = ['node_modules', '.'];
    return config;
  },
}

export default nextConfig
