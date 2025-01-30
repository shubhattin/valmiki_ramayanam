import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { generateRobotsTxtSitemap } from './src/tools/plugins/robots_txt_sitemap';

export default defineConfig({
  // @ts-ignore
  plugins: [sveltekit(), purgeCss(), ViteYaml(), generateRobotsTxtSitemap()],
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
