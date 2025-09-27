/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['supabase.com'],
  },
  webpack: (config, { isServer }) => {
    // Suppress punycode deprecation warnings
    if (isServer) {
      config.infrastructureLogging = {
        level: 'error',
      }
    }
    return config
  },
}

module.exports = nextConfig
