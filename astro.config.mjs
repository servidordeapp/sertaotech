// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import { rehypeTableWrap } from './src/lib/rehype-table-wrap.mjs';

// Vercel serve o site com cleanUrls + trailingSlash: false, ou seja /patrocinio
// (sem barra no fim) responde a partir de patrocinio/index.html. build.format
// 'directory' reproduz exatamente essa estrutura de pastas, e trailingSlash
// 'never' faz o Astro gerar links internos no mesmo formato dos canonicals.
export default defineConfig({
  site: 'https://osertaotech.com.br',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // /links é um stub de redirecionamento com robots noindex — fora do sitemap.
      filter: (page) => !page.includes('/links'),
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const tune = {
          '/': { changefreq: 'weekly', priority: 1.0 },
          '/eventos-de-tecnologia-parnaiba': { changefreq: 'weekly', priority: 0.9 },
          '/blog': { changefreq: 'weekly', priority: 0.8 },
          '/palestrantes': { changefreq: 'weekly', priority: 0.8 },
          '/caravanas': { changefreq: 'monthly', priority: 0.8 },
          '/patrocinio': { changefreq: 'monthly', priority: 0.8 },
          '/edicoes': { changefreq: 'yearly', priority: 0.6 },
        };
        return { ...item, ...(tune[path] ?? { changefreq: 'monthly', priority: 0.7 }) };
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
    // Pipeline remark/rehype clássico: o Astro 7 usa Sätteri por padrão, mas os
    // plugins que a gente precisa (slug, âncora no título, rel em link externo)
    // são plugins unified.
    processor: unified({
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } }],
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener'] }],
        rehypeTableWrap,
      ],
    }),
  },
});
