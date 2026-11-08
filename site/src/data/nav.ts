/**
 * Menu e CTA por edição. O site tem duas de cada: a edição vigente (2027, na
 * home) e o arquivo congelado (2026, em /2026). Ficam aqui pra não repetir a
 * mesma lista nas 4 páginas do arquivo.
 */
export interface NavLink {
  label: string;
  href: string;
  /** Casa com a prop `nav` da página pra marcar aria-current="page". */
  key?: string;
}

export interface NavCta {
  label: string;
  href: string;
  /** Classe extra no botão (a página de caravanas intercepta `js-cta-inscricao`). */
  class?: string;
  external?: boolean;
}

/**
 * Arquivo de 2026: as âncoras levam caminho absoluto porque o mesmo menu serve
 * a home do arquivo e as 3 páginas internas.
 */
export const NAV_2026: NavLink[] = [
  { label: 'Sobre', href: '/2026#sobre', key: 'sobre' },
  { label: 'Cronograma', href: '/2026#agenda', key: 'agenda' },
  { label: 'Palestrantes', href: '/2026/palestrantes', key: 'palestrantes' },
  { label: 'Caravanas', href: '/2026/caravanas', key: 'caravanas' },
  { label: 'Patrocínio', href: '/2026/patrocinio', key: 'patrocinio' },
  { label: 'Fotos', href: '/fotos/2026', key: 'fotos' },
];

/** O arquivo não vende mais inscrição: o CTA manda pra lista de espera de 2027. */
export const CTA_2026: NavCta = {
  label: 'Lista de espera 2027',
  href: '/#lista-de-espera',
};

/** Edição vigente: a home é a própria página, então o menu é curto. */
export const NAV_2027: NavLink[] = [
  { label: 'Patrocínio', href: '/patrocinio', key: 'patrocinio' },
  { label: 'Fotos', href: '/fotos', key: 'fotos' },
  { label: 'Edição 2026', href: '/2026' },
];

export const CTA_2027: NavCta = {
  label: 'Lista de espera',
  href: '/#lista-de-espera',
};
