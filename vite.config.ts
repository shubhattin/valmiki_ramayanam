import { sveltekit } from '@sveltejs/kit/vite';
import { join } from 'path';
import { defineConfig } from 'vitest/config';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { build_json_files } from './src/tools/vite_plugin_build_json_from_yaml';
import { partytownVite } from '@builder.io/partytown/utils';
import * as fs from 'fs';

export default defineConfig({
  plugins: [
    sveltekit(),
    purgeCss(),
    partytownVite({
      dest: join(__dirname, 'static', '~partytown')
    }),
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
    ),
    {
      name: 'Add ~partytown to config.json',
      async buildEnd() {
        const file = JSON.parse(fs.readFileSync('.vercel/output/config.json', 'utf8'));
        file.routes.push({
          src: '/~partytown/.+',
          headers: {
            'cache-control': 'public, immutable, max-age=31536000'
          }
        });
        fs.writeFileSync('.vercel/output/config.json', JSON.stringify(file, null, 4));
      }
    }
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
