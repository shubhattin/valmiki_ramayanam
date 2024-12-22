import adapter_netlify from '@sveltejs/adapter-netlify';
import adapter_node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter:
      process.env.BUILD_NODE === 'true'
        ? adapter_node()
        : adapter_netlify({
            edge: true
          }),
    alias: {
      '~': 'src',
      '@data': './data'
    }
  }
};

export default config;
