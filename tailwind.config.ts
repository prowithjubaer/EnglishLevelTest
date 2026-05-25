import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#1a2332',
          800: '#141b2d',
          900: '#0f1624',
          950: '#0a0f1a',
        },
        brand: {
          red: '#dc2626',
          'red-dark': '#b91c1c',
          'red-light': '#ef4444',
          navy: '#1a2332',
          'navy-light': '#2d3748',
          'navy-dark': '#0f1624',
        },
      },
      fontFamily: {
        bangla: ['Hind Siliguri', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
