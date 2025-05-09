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
  // Modify the experimental options to use 'loose' instead of true
  experimental: {
    esmExternals: 'loose',
  },
  // Add webpack configuration to help with module resolution
  webpack: (config) => {
    // Add this to help with module resolution
    config.resolve.modules = ['node_modules', '.'];
    
    return config;
  },
}

export default nextConfig
