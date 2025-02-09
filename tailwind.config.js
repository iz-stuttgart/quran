import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // Required for nightwind
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // You can add custom theme extensions here
    },
  },
  plugins: [
    require('nightwind')
  ],
}

export default config