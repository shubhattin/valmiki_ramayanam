import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { generateRobotsTxtSitemap } from './src/tools/plugins/robots_txt_sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), ViteYaml(), generateRobotsTxtSitemap()],
  // test: {
  //   include: ['src/**/*.{test,spec}.{js,ts}']
  // },
  server: {
    fs: {
      allow: ['./data/ramayan', './static/img']
    }
  },
  worker: {
    format: 'es'
  }
});
