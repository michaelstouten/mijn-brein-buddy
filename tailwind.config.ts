import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FEF3EC',
        foreground: '#1A1A2E',
        primary: {
          DEFAULT: '#F07329',
          light: '#FEE9D9',
          dark: '#D45F18',
          foreground: '#FFFFFF',
        },
        surface: '#FFFFFF',
        muted: {
          DEFAULT: '#9CA3AF',
          light: '#F9F5F2',
          foreground: '#6B7280',
        },
        border: '#F0EAE4',
        rekenen: '#3B82F6',
        taal: '#06B6D4',
        spelling: '#F59E0B',
        logica: '#A855F7',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 6px 24px rgba(0,0,0,0.10)',
        btn: '0 4px 14px rgba(240,115,41,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
