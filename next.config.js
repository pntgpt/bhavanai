/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  // Proxy API requests to Wrangler dev server during development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8788/api/:path*',
        },
      ];
    }
    return [];
  },
  images: {
    unoptimized: true, // Required for static export
    formats: ['image/webp', 'image/avif'], // Modern image formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Responsive breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and small image sizes
  },
  trailingSlash: true, // Better compatibility with static hosts
  
  // Performance optimizations - Requirements 12.2, 12.5
  compress: true, // Enable gzip compression
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Remove console.log in production but keep errors/warnings
    } : false,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS bundle size
    optimizePackageImports: ['lucide-react'], // Tree-shake icon imports
  },
  
  // Headers for caching - Requirement 12.5
  // Note: These are applied during build for static export
  // Actual cache headers should be configured on the hosting platform (Vercel/Netlify)
  async headers() {
    return [
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif|woff|woff2|ttf|eot|otf)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache CSS and JS with content hashing
        source: '/(.*)\\.(css|js)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Don't cache HTML pages (revalidate on each request)
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Security headers
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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
    ];
  },
};

module.exports = nextConfig;
