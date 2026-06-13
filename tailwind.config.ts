import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import animate from 'tailwindcss-animate';

export default {
  content: ['./entrypoints/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './standalone/**/*.{ts,tsx}'],
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
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('compact', '.compact &');
    }),
    animate,
  ],
} satisfies Config;
