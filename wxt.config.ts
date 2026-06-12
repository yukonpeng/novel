import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Novel Reader',
    description: 'TXT novel reader with bookshelf, chapter outline, themes, search, and reading progress.',
    version: '0.1.0',
    permissions: ['storage', 'sidePanel'],
  },
});
