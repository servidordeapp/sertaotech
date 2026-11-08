// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';

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
    sentry({ sourceMapsUploadOptions: { enabled: false } }),
    sitemap({
      // Decks públicos em public/ (passthrough) não são páginas Astro, então o
      // integration não os enxerga. Os noindex (/links, /after, /relatorio,
      // /apresentacoes, /impressos, /cerimonial, /mesa-redonda, /midia-kit/2027,
      // que só vai pelo WhatsApp) ficam de fora
      // por não serem páginas Astro nem estarem aqui.
      customPages: [
        'https://osertaotech.com.br/midia-kit/caravanas-2027',
        'https://osertaotech.com.br/midia-kit/2026',
      ],
      // São páginas Astro: sem o filtro, entrariam no sitemap mesmo com noindex.
      filter: (pagina) => !pagina.includes('/2026/patrocinio/feedback') && !pagina.includes('/certificado'),
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const tune = {
          '/': { changefreq: 'weekly', priority: 1.0 },
          '/eventos-de-tecnologia-parnaiba': { changefreq: 'weekly', priority: 0.9 },
          '/patrocinio': { changefreq: 'monthly', priority: 0.8 },
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
