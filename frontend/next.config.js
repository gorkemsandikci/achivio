/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    domains: ['achivio.app'],
    unoptimized: true, // Vercel için gerekli olabilir
  },
  
  // Vercel için output ayarları
  output: 'standalone',
  
  // Build ayarları
  experimental: {
    esmExternals: false,
  },
  
  // Webpack ayarları
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;