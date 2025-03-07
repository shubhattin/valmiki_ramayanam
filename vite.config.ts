import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import tailwindcss from '@tailwindcss/vite';
import { generateRobotsTxtSitemap } from './src/tools/plugins/robots_txt_sitemap';

export default defineConfig({
  // @ts-ignore
  plugins: [tailwindcss(), sveltekit(), ViteYaml(), generateRobotsTxtSitemap()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  server: {
    fs: {
      allow: ['./data/ramayan', './static/img']
    }
  },
  worker: {
    format: 'es'
  }
});
