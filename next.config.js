/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export for GitHub Pages
  output: 'export',
  
  // Configure image handling for static export
  images: {
    unoptimized: true,
  },
  
  // Configure TypeScript checking behavior
  typescript: {
    // This ensures type errors are treated as errors rather than warnings
    ignoreBuildErrors: false,
    
    // This tells Next.js to use your project's tsconfig.json
    tsconfigPath: './tsconfig.json'
  },
  
  // Configure webpack for your Node.js polyfills
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in the browser environment
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
        zlib: false,
      };
    }
    
    return config;
  }
};

module.exports = nextConfig;