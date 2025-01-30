import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import type { PluginOption } from 'vite';
// @ts-ignore
import robotstxt from 'generate-robotstxt';

const BASE_URL = process.env.VITE_SITE_URL ?? 'http://localhost:4173';

const make_robots_txt = async () => {
  const data: string = await robotstxt({
    policy: [
      {
        userAgent: '*',
        disallow: ['/_app/', '/~partytown/', '/img/', '/manifest.json'],
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
    }
  } as PluginOption;
}
