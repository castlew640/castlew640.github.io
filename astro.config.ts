import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://castlew640.github.io',
  output: 'static',
  vite: { build: { assetsInlineLimit: 0 } },
});
