/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  
  images: {
    unoptimized: true,
  },
  
  // Add TypeScript configuration
  typescript: {
    // This makes TypeScript errors visible in the build process
    ignoreBuildErrors: false,
    
    // Specify the path to your TypeScript configuration
    tsconfigPath: './tsconfig.json'
  },
  
  // Add source maps for better debugging
  productionBrowserSourceMaps: true,
  
  webpack: (config, { isServer }) => {
    // Avoid bundling client-only modules in server bundle
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
        zlib: false,
      };
    }
    
    // Enable better source maps for development
    if (!isServer) {
      config.devtool = 'source-map';
    }
    
    return config;
  },
  
  // Add more detailed error handling
  onError: (error) => {
    console.error('Next.js build error:', error);
  },
}

module.exports = nextConfig;