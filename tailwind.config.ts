import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/renderer/**/*.{tsx,ts,html}'],
  theme: {
    extend: {
      colors: {
        omni: {
          bg: '#0a0a0f',
          text: '#e0e0e0',
          muted: 'rgba(255, 255, 255, 0.35)',
          accent: '#82b4ff',
          'accent-bg': 'rgba(130, 180, 255, 0.12)',
          'accent-border': 'rgba(130, 180, 255, 0.6)',
          'group-text': 'rgba(130, 180, 255, 0.5)',
          'group-border': 'rgba(130, 180, 255, 0.25)',
          'multi-bg': 'rgba(130, 180, 255, 0.08)',
          'multi-border': 'rgba(130, 180, 255, 0.5)',
          'separator': 'rgba(255, 255, 255, 0.06)',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"Cascadia Code"', '"Consolas"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
