/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed the experimental.esmExternals option as it's causing issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // IMPORTANT: This tells Next.js to completely ignore TypeScript
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Added module resolution configuration
  webpack: (config) => {
    // Add this to help with module resolution
    config.resolve.modules = ['node_modules', '.'];
    
    // Force TypeScript to be resolved from node_modules
    config.resolve.alias = {
      ...config.resolve.alias,
      typescript: require.resolve('typescript'),
    };
    
    return config;
  },
  // Skip TypeScript checking completely
  transpilePackages: ['typescript'],
  // Disable TypeScript completely
  experimental: {
    forceSwcTransforms: true
  }
}

export default nextConfig
