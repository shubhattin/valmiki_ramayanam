import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import type { PluginOption } from 'vite';
import * as fs from 'fs';
// @ts-ignore
import robotstxt from 'generate-robotstxt';

const BASE_URL = process.env.VITE_SITE_URL ?? 'http://localhost:4173';

const make_robots_txt = async () => {
  const data: string = await robotstxt({
    policy: [
      {
        userAgent: '*',
        disallow: ['/_app/', '/img/', '/manifest.json'],
        crawlDelay: 2
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`
  });
  writeFileSync(resolve('static/robots.txt'), data);
};

const make_sitemap = async () => {
  const links = [
    { url: '/', changefreq: 'weekly', priority: 1 },
    { url: '/convert', changefreq: 'weekly', priority: 0.8 }
  ];
  const stream = new SitemapStream({
    hostname: BASE_URL
  });
  const data = await streamToPromise(Readable.from(links).pipe(stream)).then((data) =>
    data.toString()
  );
  writeFileSync('static/sitemap.xml', data);
};

export function generateRobotsTxtSitemap() {
  return {
    name: 'generate-robots-txt-sitemap-xml',
    async buildStart() {
      await Promise.all([make_robots_txt(), make_sitemap()]);
    },
    async closeBundle() {
      // Update the manifest to exclude robots.txt and sitemap.xml from edge functions
      const manifest_path = '.netlify/edge-functions/manifest.json';
      if (fs.existsSync(manifest_path)) {
        const manifest = JSON.parse(fs.readFileSync(manifest_path, 'utf-8'));
        for (let to_add of ['robots.txt', 'sitemap.xml']) {
          if (!manifest.functions[0].excludedPath.includes(`/${to_add}`))
            manifest.functions[0].excludedPath.push(`/${to_add}`);
        }
        writeFileSync(manifest_path, JSON.stringify(manifest));
      }
    }
  } as PluginOption;
}
