/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations for Nigerian market
  experimental: {
    optimizeCss: true,
  },

  // Image optimization for Nigerian marketplace
  images: {
    domains: [
      'cdn.tradebybarter.ng',
      'images.tradebybarter.ng',
      'storage.tradebybarter.ng',
      'localhost',
      'tradebybarter.s3.eu-north-1.amazonaws.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for Nigerian users with data concerns
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression for slower Nigerian networks
  compress: true,
  poweredByHeader: false,

  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Redirects for SEO and performance
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/marketplace',
        destination: '/feed',
        permanent: true,
      },
    ]
  },

  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/:path*`,
      },
    ]
  },

  // Output optimization for Nigerian deployment
  output: 'standalone',

  // ESLint configuration
  eslint: {
    dirs: ['src'],
    ignoreDuringBuilds: false,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Redirect trailing slashes
  trailingSlash: false,
};

module.exports = nextConfig;
