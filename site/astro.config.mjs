// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Vercel serve o site com cleanUrls + trailingSlash: false, ou seja /patrocinio
// (sem barra no fim) responde a partir de patrocinio/index.html. build.format
// 'directory' reproduz exatamente essa estrutura de pastas, e trailingSlash
// 'never' faz o Astro gerar links internos no mesmo formato dos canonicals.
export default defineConfig({
  site: 'https://osertaotech.com.br',
  trailingSlash: 'never',
  build: { format: 'directory' },
  // Knob pro caso do bind mount não propagar inotify pro container (acontece
  // em WSL2 com o repositório do lado do Windows): `VITE_POLLING=1` troca o
  // watcher do Vite por polling. Fica desligado por padrão — polling gasta CPU
  // vigiando arquivo, e aqui, com o repositório no ext4 do WSL, o container vê
  // as edições do host sem ele. Ligar no docker-compose.yml se precisar.
  vite: {
    server: {
      watch: process.env.VITE_POLLING ? { usePolling: true, interval: 300 } : undefined,
    },
  },
  integrations: [
    sitemap({
      // /links é um stub de redirecionamento com robots noindex — fora do sitemap.
      filter: (page) => !page.includes('/links'),
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const tune = {
          '/': { changefreq: 'weekly', priority: 1.0 },
          '/eventos-de-tecnologia-parnaiba': { changefreq: 'weekly', priority: 0.9 },
          // Arquivo congelado: não muda mais, mas continua indexado.
          '/2026': { changefreq: 'yearly', priority: 0.7 },
          '/2026/palestrantes': { changefreq: 'yearly', priority: 0.5 },
          '/2026/caravanas': { changefreq: 'yearly', priority: 0.5 },
          '/2026/patrocinio': { changefreq: 'yearly', priority: 0.5 },
          '/sobre': { changefreq: 'yearly', priority: 0.6 },
        };
        return { ...item, ...(tune[path] ?? { changefreq: 'monthly', priority: 0.7 }) };
      },
    }),
  ],
});
