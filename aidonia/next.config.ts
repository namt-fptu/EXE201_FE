import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ PERFORMANCE: Enable experimental features for speed
  experimental: {
    // Optimize CSS handling
    optimizeCss: true,
  },

  // ✅ TURBOPACK: Modern bundler configuration (replaces experimental.turbo)
  turbopack: {
    // Set the workspace root to avoid warnings
    root: process.cwd(),
  },

  // ✅ COMPRESSION: Enable compression for better performance
  compress: true,

  // ✅ IMAGES: Optimize image handling
  images: {
    // Add image optimization domains if using external images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
    // Optimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ WEBPACK: Custom webpack optimizations
  webpack: (config, { dev }) => {
    // Optimize for development
    if (dev) {
      // Faster rebuilds
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    // Bundle analysis support (disabled for now to avoid issues)
    // if (process.env.ANALYZE === 'true') {
    //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    //   config.plugins.push(
    //     new BundleAnalyzerPlugin({
    //       analyzerMode: 'server',
    //       openAnalyzer: true,
    //     })
    //   );
    // }

    // Optimize imports for heavy libraries
    config.resolve.alias = {
      ...config.resolve.alias,
      // Reduce apexcharts bundle size
      apexcharts: "apexcharts/dist/apexcharts.common.js",
    };

    return config;
  },

  // ✅ POWER PACK: Additional optimizations
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode for better development

  // ✅ OUTPUT: Optimize output for faster builds
  output: "standalone", // Better for production deployment
};

export default nextConfig;
