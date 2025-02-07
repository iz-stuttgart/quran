/** @type {import('next').NextConfig} */
const nextConfig = {
    // Completely disable TypeScript checking
    typescript: {
      ignoreBuildErrors: true,
      tsconfigPath: "tsconfig.json"
    },
    // Completely disable ESLint
    eslint: {
      ignoreDuringBuilds: true,
      ignoreDevelopmentErrors: true,
      ignoreDirectories: ["**/*/"]
    },
    // Required for static export
    output: 'export',
    // Disable image optimization since we're doing static export
    images: {
      unoptimized: true
    }
  }
  
  module.exports = nextConfig