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
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8D5A3',
          dark: '#A07B30',
        },
        cream: {
          DEFAULT: '#FAFAF8',
          dark: '#F5F5F0',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#6B6B6B',
          light: '#9B9B9B',
        },
        success: '#1B6B3A',
        danger: '#B00020',
      },
      fontFamily: {
        cormorant: ['Cormorant Garamond', 'Georgia', 'serif'],
        didact: ['Didact Gothic', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        gold: '0 0 0 2px rgba(201,168,76,0.3)',
      },
      transitionDuration: {
        DEFAULT: '400ms',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
