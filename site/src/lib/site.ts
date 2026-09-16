/**
 * Constantes de identidade do site. Tudo que aparece em canonical, JSON-LD,
 * Open Graph e sitemap sai daqui — uma fonte só, pra não divergir entre páginas.
 */
export const SITE = {
  url: 'https://osertaotech.com.br',
  name: 'Sertão Tech',
  legalName: 'Sertão Tech',
  locale: 'pt_BR',
  lang: 'pt-BR',
  themeColor: '#3C210B',
  gaId: 'G-62RC94ZH1Z',
  instagram: 'https://instagram.com/osertaotech',
  whatsapp: 'https://wa.me/5586999202231',
  whatsappLabel: '+55 (86) 99920-2231',
  logo: '/assets/logo.png',
  defaultOgImage: '/assets/og-cover.jpg',
  defaultOgImageAlt: 'Selo do Sertão Tech 2026 — 09 de outubro, UFDPar, Parnaíba - PI',
  /** Cidade-sede: usada em Organization.address, areaServed e nas páginas locais. */
  cidade: 'Parnaíba',
  uf: 'PI',
  regiao: 'Norte do Piauí',
} as const;

/** URL absoluta a partir de um caminho do site. Canonical nunca leva barra no fim. */
export function abs(path = '/'): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = ('/' + path).replace(/\/{2,}/g, '/');
  if (clean === '/') return SITE.url + '/';
  return SITE.url + clean.replace(/\/$/, '');
}

/** Fontes do Google usadas em todas as páginas (League Spartan, Space Grotesk, Instrument Sans, Space Mono). */
export const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=League+Spartan:wght@600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap';
