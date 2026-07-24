/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS FOR GLOBAL USERS ON LOW-BANDWIDTH NETWORKS
  // ============================================================================
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images for better performance
  images: {
    // Use modern image formats (WebP, AVIF)
    formats: ['image/avif', 'image/webp'],
    
    // Configure remote image domains (if using external images)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
    
    // Enable device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // Image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Minimum cache TTL for images (in seconds)
    minimumCacheTTL: 60,
  },
  
  // ============================================================================
  // BUNDLE SIZE OPTIMIZATION
  // ============================================================================
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Configure webpack for bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Separate vendor chunks
          default: false,
          vendors: false,
          
          // React and related libraries
          react: {
            name: 'react-vendor',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          
          // Supabase client
          supabase: {
            name: 'supabase-vendor',
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            priority: 15,
            reuseExistingChunk: true,
          },
          
          // Framer Motion (animations)
          framer: {
            name: 'framer-vendor',
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
          
          // UI components (shadcn/ui, lucide-react, etc.)
          ui: {
            name: 'ui-vendor',
            test: /[\\/]node_modules[\\/](class-variance-authority|clsx|tailwind-merge|lucide-react)[\\/]/,
            priority: 5,
            reuseExistingChunk: true,
          },
          
          // Common utilities
          common: {
            name: 'common',
            minChunks: 2,
            priority: 0,
            reuseExistingChunk: true,
          },
        },
      },
      
      // Enable module concatenation
      concatenateModules: true,
      
      // Enable tree shaking
      usedExports: true,
      sideEffects: false,
    };
    
    // Add aliases for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    
    return config;
  },
  
  // ============================================================================
  // CODE SPLITTING AND LAZY LOADING
  // ============================================================================
  
  // Experimental features for better performance
  experimental: {
    // Enable optimizePackageImports for better tree shaking
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    
    // Enable app directory optimizations
    optimizeCss: true,
    
    // Enable server components streaming
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // ============================================================================
  // OUTPUT OPTIMIZATIONS
  // ============================================================================
  
  // Configure output for better caching
  output: 'standalone',
  
  // Generate static pages for better performance
  generateEtags: true,
  
  // Power header for better caching
  poweredByHeader: false,
  
  // ============================================================================
  // COMPRESS OUTPUT
  // ============================================================================
  
  // Enable compression for smaller bundle sizes
  compress: true,
  
  // ============================================================================
  // PRODUCTION SOURCE MAPS (DISABLE FOR SMALLER BUNDLES)
  // ============================================================================
  
  // Disable source maps in production for smaller bundle sizes
  productionBrowserSourceMaps: false,
  
  // ============================================================================
  // HEADERS FOR CACHING AND SECURITY
  // ============================================================================
  
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
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
    ];
  },
  
  // ============================================================================
  // REDIRECTS
  // ============================================================================
  
  async redirects() {
    return [
      // Redirect HTTP to HTTPS (handled by hosting, but good to have)
      {
        source: '/:path((?!_next/static|_next/image|favicon.ico).*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        permanent: true,
        destination: 'https://:path',
      },
    ];
  },
  
  // ============================================================================
  // ENVIRONMENT VARIABLES
  // ============================================================================
  
  env: {
    // Supabase configuration
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // App configuration
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'FunFinity Academy',
  },
  
  // ============================================================================
  // TYPESCRIPT CONFIGURATION
  // ============================================================================
  
  typescript: {
    // Ignore build errors for faster development (remove in production)
    ignoreBuildErrors: false,
  },
  
  // ============================================================================
  // ESLINT CONFIGURATION
  // ============================================================================
  
  eslint: {
    // Ignore ESLint errors during build (remove in production)
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
