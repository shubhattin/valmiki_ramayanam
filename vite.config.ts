import { sveltekit } from '@sveltejs/kit/vite';
import { join } from 'path';
import { defineConfig } from 'vitest/config';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import react from '@vitejs/plugin-react';
import { build_json_files } from './src/tools/vite_plugin_build_json_from_yaml';

export default defineConfig({
  plugins: [
    sveltekit(),
    react(),
    purgeCss(),
    build_json_files(
      'data/ramayan/trans_en',
      'data/ramayan/trans_en/json',
      (data: Record<number, string>) => {
        const new_data: Record<number, string> = {};
        for (let key in data) {
          new_data[parseInt(key)] = data[key].replace(/\n$/g, '');
        }
        return new_data;
      }
    )
  ],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  },
  server: {
    fs: {
      allow: ['./data/ramayan']
    }
  }
});
