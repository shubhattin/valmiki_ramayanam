import adapter_vercel from '@sveltejs/adapter-vercel';
import adapter_node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter:
      process.env.BUILD_NODE === 'true'
        ? adapter_node()
        : adapter_vercel({
            runtime: 'edge',
            regions: ['sin1']
          }),
    alias: {
      '~': 'src',
      '@data': './data'
    }
  }
};

export default config;
