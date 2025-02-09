/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Add specific TypeScript handling
  typescript: {
    // Force TypeScript to be strict about checking
    ignoreBuildErrors: false,
    // Tell Next.js to show all type errors
    tsconfigPath: './tsconfig.json'
  },
  webpack: (config, { isServer }) => {
    // Add TypeScript loader configuration
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            // Force type checking during webpack build
            transpileOnly: false,
            // Show all errors
            logLevel: "info",
            // Enable detailed diagnostics
            logInfoToStdOut: true
          }
        }
      ]
    });

    // Your existing server-side configuration
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
  },
  // Add build phase logging
  onError: (error) => {
    console.error('Build phase error:', {
      phase: error.phase,
      message: error.message,
      location: error.file,
    });
  },
}

module.exports = nextConfig;