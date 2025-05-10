/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.modules = ["node_modules", "."]

    // This is safe to use with require in a .js file
    config.resolve.alias = {
      ...config.resolve.alias,
      typescript: require.resolve("typescript"),
    }

    return config
  },
  transpilePackages: ["typescript"],
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
