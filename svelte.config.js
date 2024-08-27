import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rAmAyan_map from './data/ramayan/ramayan_map.json' assert { type: 'json' };

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      runtime: 'edge'
    }),
    prerender: {
      entries: (() => {
        const entries = [];
        for (let kANDa of rAmAyan_map) {
          entries.push(`/${kANDa.index}`);
          for (let sarga of kANDa.sarga_data) {
            entries.push(`/${kANDa.index}/${sarga.index}`);
          }
        }
        return entries;
      })()
    },
    alias: {
      '@tools': './src/tools',
      '@tests': './src/tests',
      '@components': './src/components',
      '@db': './src/db',
      '@api': './src/api',
      '@data': './data',
      '@state': './src/state'
    }
  }
};

export default config;
