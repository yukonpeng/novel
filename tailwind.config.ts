import type { Config } from 'tailwindcss';

export default {
  content: ['./entrypoints/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nr: {
          bg: 'var(--nr-bg)',
          fg: 'var(--nr-fg)',
          sidebar: 'var(--nr-sidebar-bg)',
          accent: 'var(--nr-accent)',
          border: 'var(--nr-border-color)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
