/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' to enable dynamic routes for property detail pages
  // This allows proper server-side rendering and dynamic route handling
  
  images: {
    unoptimized: true, // Required for Cloudflare Pages
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
};

module.exports = nextConfig;
