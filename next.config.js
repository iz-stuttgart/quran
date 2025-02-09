/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  webpack: (config: { resolve: { fallback: any; }; }, { isServer }: any) => {
    // Avoid bundling client-only modules in server bundle
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        util: false,
        zlib: false,
        // Add any other problematic modules here
      };
    }
    return config;
  },
}

module.exports = nextConfig;