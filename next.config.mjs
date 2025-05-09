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
  },
  // Add webpack configuration to help with module resolution
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    
    // Add this to help with module resolution
    config.resolve.modules = ['node_modules', '.'];
    
    return config;
  },
}

export default nextConfig
